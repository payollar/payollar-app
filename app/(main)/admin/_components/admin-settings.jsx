"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Mail,
  DollarSign,
  Shield,
  Database,
  Bell,
  Globe,
  CreditCard,
  Users,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Platform Settings
  const [platformName, setPlatformName] = useState("Payollar");
  const [platformEmail, setPlatformEmail] = useState("admin@payollar.com");
  const [platformUrl, setPlatformUrl] = useState("https://payollar.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Email Settings
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("noreply@info.payollar.com");
  const [fromName, setFromName] = useState("Payollar");

  // Payment Settings
  const [payoutFee, setPayoutFee] = useState("2");
  const [creditPrice, setCreditPrice] = useState("10");
  const [minPayoutAmount, setMinPayoutAmount] = useState("50");
  const [payoutMethod, setPayoutMethod] = useState("paypal");

  // Security Settings
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState("8");

  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newUserNotification, setNewUserNotification] = useState(true);
  const [payoutNotification, setPayoutNotification] = useState(true);
  const [verificationNotification, setVerificationNotification] = useState(true);

  const handleSave = async (section) => {
    setLoading(true);
    setSaved(false);
    
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      toast.success(`${section} settings saved successfully`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    toast.info("Export functionality coming soon");
  };

  const handleImportData = () => {
    toast.info("Import functionality coming soon");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Settings</h1>
        <p className="text-muted-foreground">
          Manage platform configuration and settings
        </p>
      </div>

      {/* Platform Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <CardTitle>Platform Settings</CardTitle>
            </div>
            {saved && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Saved
              </Badge>
            )}
          </div>
          <CardDescription>
            Configure basic platform information and behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platformName">Platform Name</Label>
              <Input
                id="platformName"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="Payollar"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="platformEmail">Platform Email</Label>
              <Input
                id="platformEmail"
                type="email"
                value={platformEmail}
                onChange={(e) => setPlatformEmail(e.target.value)}
                placeholder="admin@payollar.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="platformUrl">Platform URL</Label>
              <Input
                id="platformUrl"
                value={platformUrl}
                onChange={(e) => setPlatformUrl(e.target.value)}
                placeholder="https://payollar.com"
              />
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Temporarily disable public access to the platform
              </p>
            </div>
            <Button
              id="maintenanceMode"
              variant={maintenanceMode ? "destructive" : "outline"}
              onClick={() => setMaintenanceMode(!maintenanceMode)}
            >
              {maintenanceMode ? "Disable" : "Enable"}
            </Button>
          </div>
          {maintenanceMode && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Maintenance mode is enabled. Only admins can access the platform.
              </AlertDescription>
            </Alert>
          )}
          <Button
            onClick={() => handleSave("Platform")}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Platform Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            <CardTitle>Email Settings</CardTitle>
          </div>
          <CardDescription>
            Configure SMTP settings for sending emails
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP Host</Label>
              <Input
                id="smtpHost"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.resend.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPort">SMTP Port</Label>
              <Input
                id="smtpPort"
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpUser">SMTP Username</Label>
              <Input
                id="smtpUser"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="resend"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpPassword">SMTP Password</Label>
              <Input
                id="smtpPassword"
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="noreply@info.payollar.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="Payollar"
              />
            </div>
          </div>
          <Button
            onClick={() => handleSave("Email")}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Email Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            <CardTitle>Payment & Payout Settings</CardTitle>
          </div>
          <CardDescription>
            Configure payment processing and payout parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="creditPrice">Credit Price (USD)</Label>
              <Input
                id="creditPrice"
                type="number"
                value={creditPrice}
                onChange={(e) => setCreditPrice(e.target.value)}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                Price per credit for clients
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutFee">Payout Fee per Credit (USD)</Label>
              <Input
                id="payoutFee"
                type="number"
                value={payoutFee}
                onChange={(e) => setPayoutFee(e.target.value)}
                placeholder="2"
              />
              <p className="text-xs text-muted-foreground">
                Platform fee deducted from creator payouts
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minPayoutAmount">Minimum Payout Amount (USD)</Label>
              <Input
                id="minPayoutAmount"
                type="number"
                value={minPayoutAmount}
                onChange={(e) => setMinPayoutAmount(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payoutMethod">Default Payout Method</Label>
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger id="payoutMethod">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={() => handleSave("Payment")}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Payment Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security Settings</CardTitle>
          </div>
          <CardDescription>
            Configure security and authentication policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                placeholder="24"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
                placeholder="8"
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Users must verify their email before accessing the platform
                </p>
              </div>
              <Button
                id="requireEmailVerification"
                variant={requireEmailVerification ? "default" : "outline"}
                onClick={() => setRequireEmailVerification(!requireEmailVerification)}
              >
                {requireEmailVerification ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Enable 2FA for admin accounts (coming soon)
                </p>
              </div>
              <Button
                id="twoFactorAuth"
                variant={twoFactorAuth ? "default" : "outline"}
                onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                disabled
              >
                {twoFactorAuth ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
          <Button
            onClick={() => handleSave("Security")}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Security Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notification Settings</CardTitle>
          </div>
          <CardDescription>
            Configure admin email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable all email notifications
                </p>
              </div>
              <Button
                id="emailNotifications"
                variant={emailNotifications ? "default" : "outline"}
                onClick={() => setEmailNotifications(!emailNotifications)}
              >
                {emailNotifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="newUserNotification">New User Registration</Label>
                <Button
                  id="newUserNotification"
                  variant={newUserNotification ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewUserNotification(!newUserNotification)}
                  disabled={!emailNotifications}
                >
                  {newUserNotification ? "On" : "Off"}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="payoutNotification">Payout Requests</Label>
                <Button
                  id="payoutNotification"
                  variant={payoutNotification ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPayoutNotification(!payoutNotification)}
                  disabled={!emailNotifications}
                >
                  {payoutNotification ? "On" : "Off"}
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <Label htmlFor="verificationNotification">Verification Requests</Label>
                <Button
                  id="verificationNotification"
                  variant={verificationNotification ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVerificationNotification(!verificationNotification)}
                  disabled={!emailNotifications}
                >
                  {verificationNotification ? "On" : "Off"}
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={() => handleSave("Notification")}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Notification Settings
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <CardTitle>System Information</CardTitle>
          </div>
          <CardDescription>
            Platform statistics and data management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Platform Version</p>
              <p className="text-lg font-semibold">1.0.0</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Database Status</p>
              <p className="text-lg font-semibold text-emerald-500">Connected</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Last Backup</p>
              <p className="text-lg font-semibold">Never</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Environment</p>
              <p className="text-lg font-semibold">Production</p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button
              variant="outline"
              onClick={handleImportData}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
