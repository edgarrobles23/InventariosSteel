using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;

namespace sln_Steel.Utilities
{
    public class Email
    {
        private readonly string _smtp;
        private readonly string _email;
        private readonly string _password;
        private readonly int _port;
        public Email(string smtp, string email, string password, int port)
        {
            _smtp = smtp;
            _email = email;
            _password = password;
            _port = port;
        }
        public async Task Enviar(string subject, string body, string[] to, List<Attachment> attachments, string[] cc, string[] bcc)
        {
            MailMessage mailMessage = new MailMessage()
            {
                From = new MailAddress(_email),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            cc?.ToList()?.ForEach(c => mailMessage.CC.Add(c));
            bcc?.ToList()?.ForEach(c => mailMessage.Bcc.Add(c));

            to.ToList().ForEach(t => mailMessage.To.Add(t));
            attachments?.ForEach(a => mailMessage.Attachments.Add(a));
            SmtpClient smtp = new SmtpClient(_smtp)
            {
                Port = _port,
                Credentials = new NetworkCredential(_email, _password),
                EnableSsl = true
            };

            await smtp.SendMailAsync(mailMessage);
            smtp.SendCompleted += Smtp_SendCompleted;
        }

        private void Smtp_SendCompleted(object sender, System.ComponentModel.AsyncCompletedEventArgs e)
        {

           
        }
    }
}
