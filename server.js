const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const devuser = require('./devusermodel');
const Account = require('./account'); // Import the Account model
const Deposit =require( './depositmodel') ; 
const Withdrawl =require( './withdrawlmodel') ;
const OnlineAccount = require( './onlineaccountmodel');
const LoanRequest = require( './loanmodel');
const Transaction = require( './transactionmodel');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));


mongoose.connect("mongodb+srv://admin:admin@cluster0.jvcybdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
  () => console.log('database connected')
)

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await devuser.findOne({ email }); // Assuming DevUser is your mongoose model
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid password' });
console.log(email);
    const token = jwt.sign({ userId: email }, 'secret_key', { expiresIn: '1h' });
   
    const temporaryUserRole = user.role;
    // Check user role and redirect accordingly
    if (user.role === 'admin') {
      return res.status(200).json({ token, role: 'admin' });
    } else if (user.role === 'user') {
      return res.status(200).json({ token, role: 'user' });
    }

    // Default response if role is not specified
    return res.status(200).json({ token });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// User registration
app.post('/register', async (req, res) => {
  try {
    const { fullname, email, mobile, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new devuser({ fullname, email, mobile, role, password: hashedPassword });
    await user.save();
    res.status(200).json({ message: 'User registered successfully' });
   
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




app.post('/new-account', async (req, res) => {
  try {
    // Extract account data from the request body
    const { fullname, email, aadharnumber, mobilenumber, initialBalance, address, role } = req.body;

    // Create a new account instance
    const newAccount = new Account({
      fullname,
      email,
      aadharnumber,
      mobilenumber,
      initialBalance,
      address,
      role
    });

    // Save the account to the database
    await newAccount.save();

    // Respond with success message
    res.status(201).json({ message: 'Account created succesfully' });
  } catch (error) {
    // Handle errors
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});







app.get('/home', (req, res) => {
  // Retrieve token from query parameter
  const token = req.query.token;
  // Render or send the home page with the token
  res.send(`Welcome to the home page! Your token is: ${token}`);
});









function generateTransactionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// POST route for deposit operation
app.post('/deposit', async (req, res) => {
  try{
  console.log('Depositing...');
  const { email, money } = req.body;
 
  console.log(email);
  console.log(money);
  const account = await Account.findOne({ email });
  if (account) {
    console.log('Account   found! Depositing now...');
    console.log(account.fullname)
  }
  console.log(account.initialBalance);
  console.log(money);

  let newMoney = parseInt(account.initialBalance) + parseInt(money);
  console.log(newMoney);
  account.updateOne({ initialBalance: newMoney })
  .then(() => console.log('Deposited'))
  .catch(err => console.error(err));

  const deposit = new Deposit({
   email,
    amount: money,
    time: new Date(),
   transactionId: generateTransactionId(), // You need to implement this function
  });
  await deposit.save();

 res.status(200).json({ message: "Deposit successful" });
}catch (err) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
}


});

app.post('/withdrawl', async (req, res) => {
  try{
  console.log('withdrawing...');
  const { email, money } = req.body;
 
  console.log(email);
  console.log(money);
  const account = await Account.findOne({ email });
  if (account) {
    console.log('Account   found! withdrawing now...');
    console.log(account.fullname)
  }
  console.log(account.initialBalance);
  console.log(money);

  let newMoney = parseInt(account.initialBalance) - parseInt(money);
  console.log(newMoney);
  if(parseInt(account.initialBalance)>parseInt(money)){
  account.updateOne({ initialBalance: newMoney })
  .then(() => console.log('Deposited'))
  .catch(err => console.error(err));
  }
  else{
     return res.status(403) .send("You don't have enough balance");
  }
  

  const withdrawl = new Withdrawl({
   email,
    amount: money,
    time: new Date(),
   transactionId: generateTransactionId(), // You need to implement this function
  });
  await withdrawl.save();

 res.status(200).json({ message: "withdrawl-successful" });
}catch (err) {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
}


});

app.post('/balance', async (req, res) => {
  try {
    console.log('balance checking');
    const { email } = req.body;
    console.log(email);
    
    let account = await Account.findOne({ email });
    if (account) {
      console.log('Account found! Balance checking.');
      console.log('Fullname:', account.fullname);
      console.log('Initial Balance:', account.initialBalance);
      res.status(200).json(account.initialBalance);
    } else {
      // Check in OnlineAccount collection if not found in Account collection
      account = await OnlineAccount.findOne({ email });
      if (account) {
        console.log('Online Account found! Balance checking.');
        console.log('Fullname:', account.fullname);
        console.log('Initial Balance:', account.balance);
        res.status(200).json(account.balance);
      } else {
        console.log('Account not found!');
        res.status(404).json({ message: 'Account not found' });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post('/transactions', async (req, res) => {
  try {
    console.log('Transactions fetching');
    const { email } = req.body;
    console.log(email);
    
    const transactions = await Deposit.find({ email });
    if (transactions.length > 0) {
      console.log('Transactions found!');
      // Log or process each transaction
      transactions.forEach(transaction => {
        console.log('Amount:', transaction.amount);
        console.log('Date:', transaction.date);
        console.log('Transaction ID:', transaction.transactionId);
      });
      res.status(200).json(transactions);
    } else {
      console.log('Transactions not found!');
      res.status(404).json({ message: 'Transactions not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});











app.post('/onlineaccount', async (req, res) => {
  try {
    // Extract account data from the request body
    const { fullname, email, aadharnumber, mobilenumber, address } = req.body;

    // Create a new account instance
    const newOnlineAccount = new OnlineAccount({
      fullname,
      email,
      aadharnumber,
      mobilenumber,
      address,
      stat: false, // Default value for stat
      balance: 0 // Default value for balance
    });

    // Save the account to the database
    await newOnlineAccount.save();

    // Respond with success message
    res.status(201).json({ message: 'Account is pending for admin approval' });
  } catch (error) {
    // Handle errors
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});







// Fetch all account requests
app.get('/onlineaccounts', async (req, res) => {
  try {
    const accounts = await OnlineAccount.find();
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Error fetching account requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update account request status
app.put('/onlineaccounts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    
    let stat = 0;
    if (action === 'approve') {
      stat = 1;
    }

    await OnlineAccount.findByIdAndUpdate(id, { stat });
    res.status(200).json({ message: 'Account request updated successfully' });
  } catch (error) {
    console.error('Error updating account request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Submit a new loan request
app.post('/loanrequestform', async (req, res) => {
  try {
      const { email, aadharNumber, subject, description, loanAmount } = req.body;

      // Create a new loan request instance
      const newLoanRequest = new LoanRequest({
          email,
          aadharNumber,
          subject,
          description,
          loanAmount
      });

      // Save the loan request to the database
      await newLoanRequest.save();

      // Respond with success message
      res.status(201).json({ message: 'Loan request submitted successfully' });
  } catch (error) {
      console.error('Error submitting loan request:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/loanrequests', async (req, res) => {
  try {
      const loanRequests = await LoanRequest.find();
      res.status(200).json(loanRequests);
  } catch (error) {
      console.error('Error fetching loan requests:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve loan request
app.put('/loanrequests/:id/approve', async (req, res) => {
  try {
      const { id } = req.params;
      // Update loan request status to 'approved'
      await LoanRequest.findByIdAndUpdate(id, { status: 'approved' });
      // Fetch loan request details
      const loanRequest = await LoanRequest.findById(id);
      // Update online account balance
      await OnlineAccount.updateOne({ email: loanRequest.email }, { $inc: { balance: loanRequest.loanAmount } });
      res.status(200).json({ message: 'Loan request approved successfully' });
  } catch (error) {
      console.error('Error approving loan request:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Decline loan request
app.put('/loanrequests/:id/decline', async (req, res) => {
  try {
      const { id } = req.params;
      // Update loan request status to 'declined'
      await LoanRequest.findByIdAndUpdate(id, { status: 'declined' });
      res.status(200).json({ message: 'Loan request declined successfully' });
  } catch (error) {
      console.error('Error declining loan request:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});










app.post('/transfer', async (req, res) => {
  try {
    // Get sender's email from authentication token
    const token = req.headers.authorization.split(' ')[1]; // Assuming token is sent in the Authorization header
    const decodedToken = jwt.verify(token, 'secret_key');
    const senderEmail = decodedToken.userId;
    console.log(decodedToken);
    console.log('sendermail is');
    console.log(senderEmail);
    const { receiverEmail, amount } = req.body;
    console.log('receivermail is');
    console.log(receiverEmail);
    
    // Define onlineSenderAccount variable outside the if block
    let onlineSenderAccount;

    // Find sender's account in Account collection
    const senderAccount = await Account.findOne({ email: senderEmail });
    if (!senderAccount) {
      console.log('sender account not found in account');
      // If sender's account not found in Account collection, search in OnlineAccount collection
      onlineSenderAccount = await OnlineAccount.findOne({ email: senderEmail });

      console.log("checking online sender ac");
      console.log(onlineSenderAccount);
      if (!onlineSenderAccount) {
        console.log('sender account not found in online account');
        return res.status(404).json({ message: 'Sender account not found' }); 
      }
    }

    // Find receiver's account in Account collection
    let receiverAccount = await Account.findOne({ email: receiverEmail });
    
    // If receiver's account not found in Account collection, search in OnlineAccount collection
    if (!receiverAccount) {
      console.log("receiver account not found in account");
      receiverAccount = await OnlineAccount.findOne({ email: receiverEmail });
      if (!receiverAccount) {
        console.log("receiver account not found in online account");
        return res.status(404).json({ message: 'Receiver account not found' });
      }
    }

    // Check if sender has sufficient balance
    const senderBalance = senderAccount ? senderAccount.initialBalance : onlineSenderAccount.balance;
    console.log(senderBalance);
    console.log('balance get');
    if (senderBalance < amount) {
      return res.status(400).json({ message: 'Insufficient balance in sender account' });
    }

    // Update sender's balance (deduct amount)  
    let newSenderBalance;
    if (senderAccount) {
      console.log(senderaccount);
      newSenderBalance = senderAccount.initialBalance - amount;
      await Account.updateOne({ email: senderEmail }, { initialBalance: newSenderBalance });
    } else {
      newSenderBalance = onlineSenderAccount.balance - amount;
      await OnlineAccount.updateOne({ email: senderEmail }, { balance: newSenderBalance });
    }

    // Update receiver's balance (add amount)
    let newReceiverBalance;
    if (receiverAccount instanceof Account) {
      newReceiverBalance = parseInt(receiverAccount.initialBalance) + parseInt(amount);
      await Account.updateOne({ email: receiverEmail }, { initialBalance: newReceiverBalance });
    } else {
      newReceiverBalance = parseInt(receiverAccount.balance) + parseInt(amount);
      await OnlineAccount.updateOne({ email: receiverEmail }, { balance: newReceiverBalance });
    }

    // Log the transfer
    console.log(`Transfer from ${senderEmail} to ${receiverEmail} successful. Amount: ${amount}`);

    // Save the transaction details
    const transaction = new Transaction({
      senderEmail,
      receiverEmail,
      amount,
      timestamp: new Date()
    });
    await transaction.save();

    res.status(200).json({ message: "Transfer successful" });
  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});






app.get('/checkbalance', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Assuming token is sent in the Authorization header
    const decodedToken = jwt.verify(token, 'secret_key');
    const userEmail = decodedToken.userId;
    console.log(userEmail);

    // Query the OnlineAccount collection to find the account associated with the user's email
    const account = await OnlineAccount.findOne({ email: userEmail });

    // If account found, return the balance
    if (account) {
      res.status(200).json({ balance: account.balance });
    } else {
      // If account not found, return an error message
      res.status(404).json({ message: 'Account not found' });
    }
  } catch (error) {
    // Handle errors
    console.error('Error checking balance:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});





app.get('/userloans', async (req, res) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    // Verify the token and extract user information
    // Assuming token is sent in the Authorization header
    const decodedToken = jwt.verify(token, 'secret_key');
    const userEmail = decodedToken.userId;
    console.log(userEmail);
   


    // Fetch loan requests for the current user
    const loanRequests = await LoanRequest.find({ email: userEmail });

  

    // Send the loan requests as a JSON response
    res.status(200).json(loanRequests);
  } catch (error) {
    console.error('Error fetching loan requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});







app.get('/onlinetransactions', async (req, res) => {
  try {
    // Extract the token from the request headers
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    // Verify the token and extract user information
    // Assuming token is sent in the Authorization header
    const decodedToken = jwt.verify(token, 'secret_key');
    const userEmail = decodedToken.userId;
    console.log(userEmail);
   


    // Fetch loan requests for the current user
    const onlinetransaction = await Transaction.find({ senderEmail: userEmail });

   

    // Send the loan requests as a JSON response
    res.status(200).json(onlinetransaction);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/closeaccount', async (req, res) => {
  try {
    const { email } = req.body;

    // Try finding and deleting user in Account collection
    const user = await Account.findOneAndDelete({ email });
    if (user) {
      // If user found and deleted in Account collection, send success response
      return res.json({ success: true });
    }

    // If user not found in Account collection, try OnlineAccount collection
    const user2 = await OnlineAccount.findOneAndDelete({ email });
    if (user2) {
      // If user found and deleted in OnlineAccount collection, send success response
      return res.json({ success: true });
    }

    // If user not found in OnlineAccount collection, try devuser collection
    const user3 = await devuser.findOneAndDelete({ email });
    if (user3) {
      // If user found and deleted in devuser collection, send success response
      return res.json({ success: true });
    }

    // If user not found in any collection, send failure response
    return res.json({ success: false, message: 'User not found' });
  } catch (error) {
    console.error(error);
    // If any error occurs, send internal server error response
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
