# Email Deliverability Guide - Reducing Spam

This guide explains how to improve email deliverability and prevent emails from going to spam.

## Current Issue

Emails are being delivered but marked as spam. This is a common issue that can be resolved by following email deliverability best practices.

## Solutions Implemented

### 1. ✅ Added Plain Text Versions

All emails now include both HTML and plain text versions. This:
- Improves deliverability (some email clients prefer plain text)
- Reduces spam score
- Ensures emails are readable in all clients

### 2. ✅ Added Friendly "From" Name

Changed from:
```
from: noreply@info.payollar.com
```

To:
```
from: Payollar <noreply@info.payollar.com>
```

This makes emails more recognizable and trustworthy.

### 3. ✅ Added Email Headers

Added proper email headers for tracking and categorization:
- `X-Entity-Ref-ID`: For tracking email types
- Tags: For categorization in Resend dashboard

### 4. ✅ Improved Email Footer

Added proper footer with:
- Recipient email address
- Copyright notice
- Clear identification of sender

## Domain Authentication (Critical for Deliverability)

To prevent spam, you **must** set up domain authentication in Resend:

### Step 1: Verify Domain in Resend

1. Go to [Resend Domains](https://resend.com/domains)
2. Find `info.payollar.com` (or add it if not there)
3. Check the verification status

### Step 2: Add DNS Records

Resend will provide DNS records you need to add. These typically include:

#### SPF Record
```
Type: TXT
Name: @ (or info.payollar.com)
Value: v=spf1 include:resend.com ~all
```

#### DKIM Record
```
Type: TXT
Name: [selector]._domainkey (provided by Resend)
Value: [public key provided by Resend]
```

#### DMARC Record (Recommended)
```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc@info.payollar.com
```

**Note:** Start with `p=none` to monitor, then move to `p=quarantine` and finally `p=reject` once you're confident.

### Step 3: Verify Records

1. Add the DNS records to your domain's DNS provider
2. Wait for DNS propagation (can take up to 48 hours)
3. Check verification status in Resend dashboard
4. Once verified, emails will have better deliverability

## Additional Best Practices

### 1. Email Content

✅ **Do:**
- Use clear, professional language
- Include plain text versions
- Keep subject lines clear and relevant
- Use proper email structure

❌ **Don't:**
- Use excessive exclamation marks (!!!) 
- Use ALL CAPS in subject lines
- Include too many links
- Use spam trigger words excessively

### 2. Sender Reputation

- **Warm up your domain**: Start with low volume and gradually increase
- **Monitor bounce rates**: Keep bounces below 5%
- **Monitor spam complaints**: Keep below 0.3%
- **Remove invalid emails**: Clean your email list regularly

### 3. Email Frequency

- Don't send too many emails too quickly
- Space out automated emails
- Respect user preferences

### 4. List Hygiene

- Remove bounced emails immediately
- Honor unsubscribe requests promptly
- Clean inactive subscribers regularly

## Testing Deliverability

### 1. Use Email Testing Tools

- [Mail-Tester](https://www.mail-tester.com/) - Test spam score
- [MXToolbox](https://mxtoolbox.com/) - Check SPF/DKIM/DMARC
- [Google Postmaster Tools](https://postmaster.google.com/) - Monitor Gmail deliverability

### 2. Test with Mail-Tester

1. Go to [mail-tester.com](https://www.mail-tester.com/)
2. Get a test email address
3. Send a verification email to that address
4. Check your spam score (aim for 8+/10)

### 3. Monitor Resend Dashboard

1. Check [Resend Dashboard](https://resend.com/emails)
2. Look for:
   - Delivery rates
   - Bounce rates
   - Spam complaints
   - Open rates (if tracking enabled)

## Quick Checklist

- [ ] Domain verified in Resend
- [ ] SPF record added and verified
- [ ] DKIM record added and verified
- [ ] DMARC record added (start with `p=none`)
- [ ] Plain text versions added to all emails
- [ ] Friendly "From" name configured
- [ ] Email footers include proper information
- [ ] Tested with mail-tester.com
- [ ] Monitoring bounce and spam complaint rates

## Current Email Configuration

Your emails are configured to use:
- **From Address**: `Payollar <noreply@info.payollar.com>`
- **Support Email**: `support@info.payollar.com`
- **Domain**: `info.payollar.com`

## Next Steps

1. **Verify DNS Records**: Add SPF, DKIM, and DMARC records to your domain
2. **Test Deliverability**: Use mail-tester.com to check spam score
3. **Monitor**: Watch Resend dashboard for delivery metrics
4. **Gradually Increase Volume**: Start with low volume and increase gradually

## Troubleshooting

### Emails Still Going to Spam?

1. **Check DNS Records**: Verify SPF, DKIM, and DMARC are properly configured
2. **Check Domain Reputation**: Use tools like MXToolbox to check domain health
3. **Review Email Content**: Avoid spam trigger words
4. **Check Sender Score**: Use Sender Score to check your domain reputation
5. **Contact Resend Support**: They can help diagnose deliverability issues

### Domain Not Verified?

1. Check DNS records are correct
2. Wait for DNS propagation (up to 48 hours)
3. Verify records using online DNS checkers
4. Contact your DNS provider if issues persist

## Resources

- [Resend Deliverability Guide](https://resend.com/docs/deliverability)
- [SPF Record Generator](https://www.spf-record.com/)
- [DMARC Record Generator](https://www.dmarcanalyzer.com/)
- [Mail-Tester](https://www.mail-tester.com/)
- [Google Postmaster Tools](https://postmaster.google.com/)
