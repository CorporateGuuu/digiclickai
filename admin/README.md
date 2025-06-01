# MDTS Tech Store Admin Dashboard

This directory contains the admin dashboard for the MDTS Tech Store e-commerce platform.

## Accessing the Admin Dashboard

The admin dashboard is accessible at `/admin` or `/admin/dashboard`. To access it, you need admin credentials.

### Default Admin Credentials

- **Email**: admin@mdtstech.store
- **Password**: The password is generated during the security setup process

If you haven't run the security setup script yet, run:

```bash
./scripts/fix-security.sh
```

This will generate a secure random password for the admin account and display it in the console.

## Admin Dashboard Features

The admin dashboard provides the following features:

1. **Dashboard Overview**
   - Sales statistics
   - Recent orders
   - Low stock alerts
   - Customer activity

2. **Product Management**
   - View all products
   - Add new products
   - Edit existing products
   - Delete products
   - Manage product categories
   - Manage product specifications

3. **Order Management**
   - View all orders
   - Update order status
   - Process refunds
   - Generate invoices

4. **Customer Management**
   - View all customers
   - Edit customer information
   - View customer orders
   - Manage customer accounts

5. **Content Management**
   - Manage homepage banners
   - Manage featured products
   - Manage promotional content

6. **Settings**
   - General store settings
   - Payment gateway settings
   - Shipping settings
   - Tax settings
   - Email templates

## Security Best Practices

1. **Change the default admin password immediately**
   - Run `./scripts/update-admin-password.js` to generate a new secure password

2. **Use strong, unique passwords**
   - At least 16 characters
   - Mix of uppercase, lowercase, numbers, and special characters

3. **Enable Two-Factor Authentication (2FA)**
   - Set up 2FA for all admin accounts

4. **Limit admin access to trusted IP addresses**
   - Configure your firewall to restrict admin access to specific IP addresses

5. **Regularly audit admin actions**
   - Review the admin activity logs regularly

6. **Keep the admin dashboard updated**
   - Apply security patches promptly

7. **Use HTTPS for all admin traffic**
   - Ensure SSL/TLS is properly configured

8. **Implement session timeouts**
   - Automatically log out inactive admin sessions

## Troubleshooting

If you're having trouble accessing the admin dashboard:

1. **Check your credentials**
   - Make sure you're using the correct email and password

2. **Check the database connection**
   - Ensure the database is running and accessible

3. **Check the server logs**
   - Look for any error messages in the server logs

4. **Reset the admin password**
   - Run `node scripts/update-admin-password.js` to reset the admin password

5. **Clear your browser cache and cookies**
   - Sometimes cached data can cause login issues

If you continue to have issues, please contact the development team for assistance.
