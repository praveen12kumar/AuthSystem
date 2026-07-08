import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MailCheck, TriangleAlert, CircleCheck, Loader2 } from 'lucide-react';

export default function OneTimePassword({ isPending, isSuccess, error, value, setValue, onComplete, email }) {

  const slotStyle = "w-11 h-12 md:w-13 md:h-14 rounded-lg border border-input bg-background text-foreground text-xl md:text-2xl font-semibold shadow-xs transition-all data-[active=true]:border-primary data-[active=true]:ring-4 data-[active=true]:ring-primary/15";

  return (
    <div className="w-full h-full">
      <Card className="w-full max-w-[420px]">
        <CardHeader className="items-center text-center gap-2">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-1">
            <MailCheck className="size-7" />
          </div>
          <CardTitle className="text-xl font-bold">OTP Verification</CardTitle>
          <CardDescription className="text-balance">
            Enter the 6-digit code sent to{" "}
            {email ? <span className="font-medium text-foreground">{email}</span> : "your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            value={value}
            onChange={setValue}
            onComplete={onComplete}
            disabled={isPending || isSuccess}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} className={slotStyle} />
              <InputOTPSlot index={1} className={slotStyle} />
              <InputOTPSlot index={2} className={slotStyle} />
              <InputOTPSlot index={3} className={slotStyle} />
              <InputOTPSlot index={4} className={slotStyle} />
              <InputOTPSlot index={5} className={slotStyle} />
            </InputOTPGroup>
          </InputOTP>

          {isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Verifying...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-destructive/15 rounded-md text-destructive-foreground w-full text-red-600 text-xs p-3">
              <TriangleAlert className="size-4 shrink-0" /> <p>{error}</p>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 bg-emerald-100 rounded-md text-emerald-800 w-full text-xs p-3">
              <CircleCheck className="size-4 shrink-0" /> <p>OTP verified successfully. Redirecting...</p>
            </div>
          )}

          <p className="text-muted-foreground text-xs text-center">Please do not refresh the page</p>
        </CardContent>
      </Card>
    </div>
  )
}
