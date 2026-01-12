# DNS Setup Guide for Email Deliverability

This guide will help you set up DNS records for `info.payollar.com` to improve email deliverability and prevent emails from going to spam.

## Why DNS Records Matter

Email providers (Gmail, Outlook, etc.) check DNS records to verify that emails are legitimate. Without proper DNS records, emails are more likely to be marked as spam.

## Required DNS Records

You need to add **3 types of DNS records** to your domain:

1. **SPF** (Sender Policy Framework) - Authorizes which servers can send emails
2. **DKIM** (DomainKeys Identified Mail) - Adds digital signature to emails
3. **DMARC** (Domain-based Message Authentication) - Tells providers what to do with failed emails

## Step-by-Step Setup

### Step 1: Get DNS Records from Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Find or add `info.payollar.com`
3. Click on the domain to see DNS records
4. You'll see records like:
   - SPF record
   - DKIM record (with selector)
   - DMARC record (optional but recommended)

### Step 2: Add Records to Your DNS Provider

The exact steps depend on your DNS provider (Cloudflare, GoDaddy, Namecheap, etc.), but the process is similar:

#### For `info.payollar.com` subdomain:

1. **Log in to your DNS provider**
2. **Find DNS management** for `payollar.com`
3. **Add records for `info.payollar.com`**:

#### SPF Record
```
Type: TXT
Name: info (or @ if adding to root domain)
Value: v=spf1 include:resend.com ~all
TTL: 3600 (or default)
```

#### DKIM Record
```
Type: TXT
Name: [selector]._domainkey.info (provided by Resend)
Value: [long string provided by Resend]
TTL: 3600 (or default)
```

**Example:**
- If Resend gives you selector `rs1`, the name would be: `rs1._domainkey.info`
- The value will be a long string starting with `v=DKIM1; k=rsa; p=...`

#### DMARC Record (Recommended)
```
Type: TXT
Name: _dmarc.info (or _dmarc if for root domain)
Value: v=DMARC1; p=none; rua=mailto:dmarc@info.payollar.com
TTL: 3600 (or default)
```

**Note:** Start with `p=none` to monitor. Once verified, you can change to `p=quarantine` and eventually `p=reject`.

### Step 3: Verify Records

1. **Wait for DNS propagation** (5 minutes to 48 hours, usually 1-2 hours)
2. **Check in Resend Dashboard** - Status should change to "Verified"
3. **Test with online tools**:
   - [MXToolbox SPF Check](https://mxtoolbox.com/spf.aspx)
   - [MXToolbox DKIM Check](https://mxtoolbox.com/dkim.aspx)
   - [MXToolbox DMARC Check](https://mxtoolbox.com/dmarc.aspx)

### Step 4: Test Email Deliverability

1. **Use Mail-Tester**:
   - Go to [mail-tester.com](https://www.mail-tester.com/)
   - Get a test email address
   - Send a verification email to that address
   - Check your spam score (aim for 8+/10)

2. **Send Test Emails**:
   - Send to Gmail, Outlook, Yahoo
   - Check if they arrive in inbox (not spam)
   - Check email headers for SPF/DKIM pass

## Common DNS Providers

### Cloudflare

1. Go to Cloudflare Dashboard
2. Select `payollar.com` domain
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Select **TXT** type
6. Enter name and value
7. Click **Save**

### GoDaddy

1. Go to GoDaddy Domain Manager
2. Select `payollar.com`
3. Go to **DNS Management**
4. Click **Add** under **Records**
5. Select **TXT** type
6. Enter name and value
7. Click **Save**

### Namecheap

1. Go to Namecheap Dashboard
2. Select **Domain List**
3. Click **Manage** next to `payollar.com`
4. Go to **Advanced DNS** tab
5. Click **Add New Record**
6. Select **TXT Record**
7. Enter name and value
8. Click **Save**

## Verification Checklist

After adding DNS records, verify:

- [ ] SPF record shows as "Pass" in email headers
- [ ] DKIM record shows as "Pass" in email headers
- [ ] DMARC record is properly configured
- [ ] Domain shows as "Verified" in Resend dashboard
- [ ] Mail-tester.com score is 8+/10
- [ ] Test emails arrive in inbox (not spam)

## Troubleshooting

### Records Not Verifying

1. **Check DNS propagation**:
   ```bash
   # Check SPF
   dig TXT info.payollar.com
   
   # Check DKIM (replace selector)
   dig TXT rs1._domainkey.info.payollar.com
   
   # Check DMARC
   dig TXT _dmarc.info.payollar.com
   ```

2. **Common Issues**:
   - **Wrong subdomain**: Make sure records are for `info.payollar.com`, not `payollar.com`
   - **Typo in value**: Copy-paste the exact value from Resend
   - **TTL too high**: Lower TTL to 3600 for faster updates
   - **DNS not propagated**: Wait longer (up to 48 hours)

### Still Going to Spam After Setup

1. **Check domain reputation**:
   - Use [Sender Score](https://www.senderscore.org/)
   - Check [Google Postmaster Tools](https://postmaster.google.com/)

2. **Warm up your domain**:
   - Start with low email volume
   - Gradually increase over weeks
   - Monitor bounce and spam complaint rates

3. **Review email content**:
   - Avoid spam trigger words
   - Keep subject lines clear
   - Include plain text versions

## Important Notes

- **DNS propagation can take up to 48 hours**, but usually completes within 1-2 hours
- **Start with `p=none` for DMARC** to monitor, then tighten later
- **Keep bounce rates below 5%** and spam complaints below 0.3%
- **Monitor Resend dashboard** regularly for delivery metrics

## Next Steps

1. Add DNS records to your domain
2. Wait for verification in Resend
3. Test with mail-tester.com
4. Monitor deliverability metrics
5. Gradually increase email volume

## Support

If you need help:
- [Resend Support](https://resend.com/support)
- [Resend Documentation](https://resend.com/docs)
- Your DNS provider's support
