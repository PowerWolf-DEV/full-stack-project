module.exports = function(email) {
  return {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Confirmation of registration',
    html: `
      <h1>Welcome to our store</h1>
      <p>You've successfully created an account with email - ${email}</p>
      <hr />
      <a href="${process.env.BASE_URL}">SP Family Shop</a>
    `
  }
}