# Gmail sender setup for the Compus beta

Compus accepts student accounts only at **@srmist.edu.in**. The sender can be a separate Gmail account you own; it does not need to be an SRM email address.

1. Choose a Gmail account for sending Compus verification messages. A dedicated account keeps app mail separate from personal mail.
2. Enable Google 2-Step Verification, then create an app password for Compus. You must do this in your Google account. Use an app password, not your usual account password. If Google does not offer app passwords for that account, do not disable account protections; use another eligible sender account or an OAuth/transactional email provider.
3. In the Railway backend service's **Variables**, enter:

| Variable | Value |
| --- | --- |
| SMTP_HOST | smtp.gmail.com |
| SMTP_PORT | 465 |
| SMTP_USER | Your sender Gmail address |
| SMTP_PASS | The Google app password (private) |
| SMTP_FROM | Compus <your sender Gmail address> |
| APP_URL | https://compus-ashy.vercel.app |
| CORS_ORIGINS | https://compus-ashy.vercel.app |

For local development, put the same values in the ignored `server/.env` file instead. Do not put them in the frontend's environment variables, commit them, or paste them into chat.

4. Restart/redeploy the backend. Test delivery to an SRM inbox, including its spam folder. The current app correctly shows an error if delivery fails; it will not accept a fixed demo code.
5. Gmail SMTP is intended here for a small beta and is subject to Google's sending limits and account policies. Move to a transactional provider such as Resend after verifying a domain you control if volume increases.

Google references: [App passwords](https://support.google.com/mail/answer/185833?hl=en), [SMTP setup](https://support.google.com/a/answer/176600?hl=en).

Deployment, database migration and previously exposed credential rotation are separate remaining tasks described in [STEP1-DEPLOYMENT.md](STEP1-DEPLOYMENT.md).
