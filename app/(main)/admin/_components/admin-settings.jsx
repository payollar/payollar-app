"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  DollarSign,
  Shield,
  Database,
  Bell,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PANEL =
  "rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]";

function Field({ id, label, hint, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-wide text-slate-400"
      >
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function SettingsSection({ icon: Icon, title, description, children, action }) {
  return (
    <section className={cn(PANEL, "overflow-hidden")}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-start sm:justify-between md:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="space-y-5 p-4 md:p-5">{children}</div>
    </section>
  );
}

function ToggleRow({
  id,
  label,
  description,
  enabled,
  onToggle,
  disabled = false,
  danger = false,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-semibold text-slate-950">
          {label}
        </Label>
        {description ? (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      <Button
        id={id}
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "h-9 shrink-0 rounded-full px-4",
          enabled
            ? danger
              ? "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
              : "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 hover:text-white"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
        )}
      >
        {enabled ? (danger ? "Disable" : "Enabled") : danger ? "Enable" : "Disabled"}
      </Button>
    </div>
  );
}

function SaveButton({ loading, onClick, label }) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="h-10 rounded-full bg-slate-950 px-4 text-white hover:bg-slate-800"
    >
      {loading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Save className="mr-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

const inputClass =
  "h-10 rounded-full border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400";

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [savedSection, setSavedSection] = useState("");

  const [platformName, setPlatformName] = useState("Payollar");
  const [platformEmail, setPlatformEmail] = useState("admin@payollar.com");
  const [platformUrl, setPlatformUrl] = useState("https://payollar.com");
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [fromEmail, setFromEmail] = useState("noreply@payollar.com");
  const [fromName, setFromName] = useState("Payollar");

  const [payoutFee, setPayoutFee] = useState("2");
  const [creditPrice, setCreditPrice] = useState("10");
  const [minPayoutAmount, setMinPayoutAmount] = useState("50");
  const [payoutMethod, setPayoutMethod] = useState("paypal");

  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [passwordMinLength, setPasswordMinLength] = useState("8");

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [newUserNotification, setNewUserNotification] = useState(true);
  const [payoutNotification, setPayoutNotification] = useState(true);
  const [verificationNotification, setVerificationNotification] = useState(true);

  const handleSave = async (section) => {
    setLoading(true);
    setSavedSection("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast.success(`${section} settings saved successfully`);
      setSavedSection(section);
      setTimeout(() => setSavedSection(""), 3000);
    } catch (error) {
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setLoading(false);
    }
  };

  const savedBadge = (section) =>
    savedSection === section ? (
      <Badge
        variant="outline"
        className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
      >
        <CheckCircle2 className="mr-1 h-3 w-3" />
        Saved
      </Badge>
    ) : null;

  return (
    <div className="-m-3 min-h-full min-w-0 space-y-4 bg-[#f4f6fb] p-3 text-slate-900 md:-m-6 md:space-y-5 md:p-5">
      <div>
        <h1 className="text-lg font-semibold text-slate-950 md:text-xl">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage platform configuration, email, payments, and security.
        </p>
      </div>

      <SettingsSection
        icon={Globe}
        title="Platform"
        description="Basic platform identity and public access controls."
        action={savedBadge("Platform")}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="platformName" label="Platform name">
            <Input
              id="platformName"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              placeholder="Payollar"
              className={inputClass}
            />
          </Field>
          <Field id="platformEmail" label="Platform email">
            <Input
              id="platformEmail"
              type="email"
              value={platformEmail}
              onChange={(e) => setPlatformEmail(e.target.value)}
              placeholder="admin@payollar.com"
              className={inputClass}
            />
          </Field>
          <Field id="platformUrl" label="Platform URL" className="md:col-span-2">
            <Input
              id="platformUrl"
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              placeholder="https://payollar.com"
              className={inputClass}
            />
          </Field>
        </div>

        <ToggleRow
          id="maintenanceMode"
          label="Maintenance mode"
          description="Temporarily disable public access to the platform."
          enabled={maintenanceMode}
          danger
          onToggle={() => setMaintenanceMode(!maintenanceMode)}
        />

        {maintenanceMode ? (
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Maintenance mode is on. Only admins can access the platform.
          </div>
        ) : null}

        <SaveButton
          loading={loading}
          onClick={() => handleSave("Platform")}
          label="Save platform settings"
        />
      </SettingsSection>

      <SettingsSection
        icon={Mail}
        title="Email"
        description="SMTP credentials used for transactional messages."
        action={savedBadge("Email")}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="smtpHost" label="SMTP host">
            <Input
              id="smtpHost"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.resend.com"
              className={inputClass}
            />
          </Field>
          <Field id="smtpPort" label="SMTP port">
            <Input
              id="smtpPort"
              type="number"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="587"
              className={inputClass}
            />
          </Field>
          <Field id="smtpUser" label="SMTP username">
            <Input
              id="smtpUser"
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="resend"
              className={inputClass}
            />
          </Field>
          <Field id="smtpPassword" label="SMTP password">
            <Input
              id="smtpPassword"
              type="password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
            />
          </Field>
          <Field id="fromEmail" label="From email">
            <Input
              id="fromEmail"
              type="email"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@payollar.com"
              className={inputClass}
            />
          </Field>
          <Field id="fromName" label="From name">
            <Input
              id="fromName"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Payollar"
              className={inputClass}
            />
          </Field>
        </div>
        <SaveButton
          loading={loading}
          onClick={() => handleSave("Email")}
          label="Save email settings"
        />
      </SettingsSection>

      <SettingsSection
        icon={DollarSign}
        title="Payments & payouts"
        description="Credit pricing and creator payout defaults."
        action={savedBadge("Payment")}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="creditPrice"
            label="Credit price (USD)"
            hint="Price per credit for clients"
          >
            <Input
              id="creditPrice"
              type="number"
              value={creditPrice}
              onChange={(e) => setCreditPrice(e.target.value)}
              placeholder="10"
              className={inputClass}
            />
          </Field>
          <Field
            id="payoutFee"
            label="Payout fee per credit (USD)"
            hint="Platform fee deducted from creator payouts"
          >
            <Input
              id="payoutFee"
              type="number"
              value={payoutFee}
              onChange={(e) => setPayoutFee(e.target.value)}
              placeholder="2"
              className={inputClass}
            />
          </Field>
          <Field id="minPayoutAmount" label="Minimum payout (USD)">
            <Input
              id="minPayoutAmount"
              type="number"
              value={minPayoutAmount}
              onChange={(e) => setMinPayoutAmount(e.target.value)}
              placeholder="50"
              className={inputClass}
            />
          </Field>
          <Field id="payoutMethod" label="Default payout method">
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger id="payoutMethod" className={inputClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="bank">Bank transfer</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <SaveButton
          loading={loading}
          onClick={() => handleSave("Payment")}
          label="Save payment settings"
        />
      </SettingsSection>

      <SettingsSection
        icon={Shield}
        title="Security"
        description="Session, password, and authentication policies."
        action={savedBadge("Security")}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="sessionTimeout" label="Session timeout (hours)">
            <Input
              id="sessionTimeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              placeholder="24"
              className={inputClass}
            />
          </Field>
          <Field id="passwordMinLength" label="Minimum password length">
            <Input
              id="passwordMinLength"
              type="number"
              value={passwordMinLength}
              onChange={(e) => setPasswordMinLength(e.target.value)}
              placeholder="8"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="space-y-3">
          <ToggleRow
            id="requireEmailVerification"
            label="Require email verification"
            description="Users must verify email before using the platform."
            enabled={requireEmailVerification}
            onToggle={() =>
              setRequireEmailVerification(!requireEmailVerification)
            }
          />
          <ToggleRow
            id="twoFactorAuth"
            label="Two-factor authentication"
            description="Enable 2FA for admin accounts (coming soon)."
            enabled={twoFactorAuth}
            disabled
            onToggle={() => setTwoFactorAuth(!twoFactorAuth)}
          />
        </div>

        <SaveButton
          loading={loading}
          onClick={() => handleSave("Security")}
          label="Save security settings"
        />
      </SettingsSection>

      <SettingsSection
        icon={Bell}
        title="Notifications"
        description="Choose which admin alerts are emailed."
        action={savedBadge("Notification")}
      >
        <ToggleRow
          id="emailNotifications"
          label="Email notifications"
          description="Master switch for all admin email alerts."
          enabled={emailNotifications}
          onToggle={() => setEmailNotifications(!emailNotifications)}
        />

        <div className="space-y-3">
          {[
            {
              id: "newUserNotification",
              label: "New user registration",
              enabled: newUserNotification,
              onToggle: () => setNewUserNotification(!newUserNotification),
            },
            {
              id: "payoutNotification",
              label: "Payout requests",
              enabled: payoutNotification,
              onToggle: () => setPayoutNotification(!payoutNotification),
            },
            {
              id: "verificationNotification",
              label: "Verification requests",
              enabled: verificationNotification,
              onToggle: () =>
                setVerificationNotification(!verificationNotification),
            },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3"
            >
              <Label
                htmlFor={item.id}
                className="text-sm font-medium text-slate-800"
              >
                {item.label}
              </Label>
              <Button
                id={item.id}
                type="button"
                size="sm"
                variant="outline"
                disabled={!emailNotifications}
                onClick={item.onToggle}
                className={cn(
                  "h-8 rounded-full px-3",
                  item.enabled && emailNotifications
                    ? "border-slate-950 bg-slate-950 text-white hover:bg-slate-800 hover:text-white"
                    : "border-slate-200 text-slate-600"
                )}
              >
                {item.enabled && emailNotifications ? "On" : "Off"}
              </Button>
            </div>
          ))}
        </div>

        <SaveButton
          loading={loading}
          onClick={() => handleSave("Notification")}
          label="Save notification settings"
        />
      </SettingsSection>

      <SettingsSection
        icon={Database}
        title="System"
        description="Environment status and data tools."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Platform version", value: "1.0.0" },
            { label: "Database", value: "Connected", tone: "ok" },
            { label: "Last backup", value: "Never" },
            { label: "Environment", value: "Production" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <p className="text-xs font-medium text-slate-500">{stat.label}</p>
              <p
                className={cn(
                  "mt-1 text-lg font-semibold tabular-nums",
                  stat.tone === "ok" ? "text-emerald-700" : "text-slate-950"
                )}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Export functionality coming soon")}
            className="h-10 rounded-full border-slate-200 text-slate-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Export data
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.info("Import functionality coming soon")}
            className="h-10 rounded-full border-slate-200 text-slate-700"
          >
            <Upload className="mr-2 h-4 w-4" />
            Import data
          </Button>
        </div>
      </SettingsSection>
    </div>
  );
}
