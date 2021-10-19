module.exports = function(email, token) {
  return {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Access recovery',
    html: `
      <h1>Did you forget password?</h1>
      <p>If not, please ignore this letter</p>
      <p>Otherwise click on the link below:</p>
      <p><a href="${process.env.BASE_URL}/auth/password/${token}">Recovery access</a></p>
      <hr />
      <a href="${process.env.BASE_URL}">SP Family Shop</a>
    `
  }
}