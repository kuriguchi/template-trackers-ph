# Digital Market App

A modern Next.js app for selling digital templates, featuring payment methods such as QRPH via PayMongo, accessing google services via OAuth, and a functioning landing page.

### Access the app
Open \<domain_here\> in your browser.


## Payment Flow
1. Buyer enters email and pays via GCash QRPH
2. QR code is shown for payment
3. After payment, buyer confirms and receives Google Drive folder

## Note
- Google Drive folder is shared with buyer's email after payment confirmation

## Environment variables
- PAYMONGO_SECRET_KEY
- GOOGLE_OAUTH_CLIENT_ID
- GOOGLE_OAUTH_CLIENT_SECRET
- GOOGLE_OAUTH_REFRESH_TOKEN
- GOOGLE_TEMPLATE_FOLDER_ID (bookkeeping)
- GOOGLE_TEMPLATE_FOLDER_ID_ACADEMIC_TRACKING (2nd product)
- GOOGLE_TEMPLATE_FOLDER_ID_ALL_IN_ONE_FINANCE (3rd product)
- GOOGLE_ORDERS_FOLDER_ID (optional)
- PAYMONGO_RETURN_URL or NEXT_PUBLIC_APP_URL

## License
MIT

---
For questions or support, contact this email: gutierrezck12@gmail.com
