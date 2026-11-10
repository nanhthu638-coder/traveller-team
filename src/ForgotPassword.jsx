import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { HoldToReveal } from './AuthPage.jsx'
import { postApiJson } from './api.js'

const OTP_LENGTH = 6

function ForgotPassword({ onBack, onComplete }) {
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [seconds, setSeconds] = useState(60)
  const [developmentCode, setDevelopmentCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordRevealed, setPasswordRevealed] = useState(false)
  const [confirmationRevealed, setConfirmationRevealed] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const otpRefs = useRef([])

  useEffect(() => {
    if (step !== 2 || seconds <= 0) return undefined
    const timerId = window.setInterval(() => setSeconds((remaining) => Math.max(remaining - 1, 0)), 1000)
    return () => window.clearInterval(timerId)
  }, [step, seconds])

  useEffect(() => {
    if (step === 2) otpRefs.current[0]?.focus()
  }, [step])

  const requestOtp = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await postApiJson('forgot-password', { identifier: identifier.trim() })
      setDevelopmentCode(result.developmentCode || '')
      setSeconds(60)
      setStep(2)
    } catch (requestError) {
      setError(requestError.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const updateOtp = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item))
    if (digit && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus()
  }

  const pasteOtp = (event) => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!digits) return
    event.preventDefault()
    setOtp(Array.from({ length: OTP_LENGTH }, (_, index) => digits[index] || ''))
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus()
  }

  const verifyOtp = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const result = await postApiJson('verify-otp', { identifier: identifier.trim(), code: otp.join('') })
      setResetToken(result.resetToken)
      setStep(3)
    } catch (verifyError) {
      setError(verifyError.message || 'Mã xác nhận chưa đúng. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const resendOtp = async () => {
    setError('')
    setSubmitting(true)
    try {
      const result = await postApiJson('forgot-password', { identifier: identifier.trim() })
      setDevelopmentCode(result.developmentCode || '')
      setOtp(Array(OTP_LENGTH).fill(''))
      setSeconds(60)
      otpRefs.current[0]?.focus()
    } catch (requestError) {
      setError(requestError.message || 'Không thể gửi lại mã. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetPassword = async (event) => {
    event.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Mật khẩu cần có ít nhất 8 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận chưa khớp.')
      return
    }
    setSubmitting(true)
    try {
      await postApiJson('reset-password', { resetToken, password })
      onComplete('Đổi mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.')
    } catch (resetError) {
      setError(resetError.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  const stepTitle = ['Tìm tài khoản của bạn', 'Xác nhận danh tính', 'Tạo mật khẩu mới'][step - 1]
  const stepDescription = [
    'Nhập email hoặc số điện thoại đã đăng ký. Chúng tôi sẽ gửi mã xác nhận cho bạn.',
    `Nhập mã gồm 6 chữ số đã được gửi đến ${identifier}.`,
    'Tạo mật khẩu mới để bảo vệ tài khoản StuWork của bạn.',
  ][step - 1]

  return (
    <main className="forgot-page">
      <div className="forgot-orb forgot-orb-one" />
      <div className="forgot-orb forgot-orb-two" />
      <section className="forgot-card">
        <button type="button" className="forgot-back" onClick={step === 1 ? onBack : () => { setError(''); setStep(step - 1) }}>
          <ArrowLeft size={17} /> {step === 1 ? 'Quay lại đăng nhập' : 'Quay lại'}
        </button>
        <a className="brand forgot-brand" href="/" onClick={(event) => { event.preventDefault(); onBack() }}>
          <span className="brand-icon"><LockKeyhole size={19} /></span>
          <span>Stu<span>Work</span></span>
        </a>
        <div className="forgot-progress" aria-label={`Bước ${step} trên 3`}>
          {[1, 2, 3].map((item) => <span key={item} className={item <= step ? 'progress-active' : ''} />)}
        </div>
        <div className="forgot-heading">
          <span className="forgot-step-label">BƯỚC {step} / 3</span>
          <h1>{stepTitle}</h1>
          <p>{stepDescription}</p>
        </div>

        {step === 1 && (
          <form className="forgot-form" onSubmit={requestOtp}>
            <label className="form-label" htmlFor="forgot-identifier">Email hoặc số điện thoại</label>
            <div className="form-control">
              <Mail size={18} />
              <input
                id="forgot-identifier"
                type="text"
                autoComplete="username"
                autoFocus
                placeholder="ban@email.com hoặc 0912 345 678"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                required
              />
            </div>
            <p className="forgot-security-note"><ShieldCheck size={15} /> Mã xác nhận chỉ sử dụng một lần và có hiệu lực trong 5 phút.</p>
            {error && <div className="form-api-error" role="alert">{error}</div>}
            <button className="auth-submit" disabled={submitting} type="submit">
              {submitting ? 'Đang gửi...' : 'Gửi mã OTP'} {!submitting && <ArrowRight size={17} />}
            </button>
          </form>
        )}

        {step === 2 && (
          <form className="forgot-form" onSubmit={verifyOtp}>
            <label className="form-label" htmlFor="otp-0">Mã xác nhận OTP</label>
            <div className="otp-inputs" onPaste={pasteOtp}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => { otpRefs.current[index] = element }}
                  id={`otp-${index}`}
                  aria-label={`Chữ số ${index + 1} của mã OTP`}
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateOtp(index, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
                    if (event.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus()
                    if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus()
                  }}
                />
              ))}
            </div>
            {developmentCode && <p className="demo-otp-note">Mã OTP demo: <strong>{developmentCode}</strong></p>}
            <div className="otp-resend">
              {seconds > 0 ? (
                <span>Gửi lại mã sau <strong>{seconds}s</strong></span>
              ) : (
                <span>Chưa nhận được mã? <button type="button" onClick={resendOtp} disabled={submitting}>Gửi lại mã</button></span>
              )}
            </div>
            {error && <div className="form-api-error" role="alert">{error}</div>}
            <button className="auth-submit" disabled={submitting || otp.some((digit) => !digit)} type="submit">
              {submitting ? 'Đang xác nhận...' : 'Xác nhận'} {!submitting && <ArrowRight size={17} />}
            </button>
          </form>
        )}

        {step === 3 && (
          <form className="forgot-form" onSubmit={resetPassword}>
            <label className="form-label" htmlFor="new-password">Mật khẩu mới</label>
            <div className="form-control form-control-password">
              <LockKeyhole size={18} />
              <input id="new-password" type={passwordRevealed ? 'text' : 'password'} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
              <HoldToReveal inputId="new-password" revealed={passwordRevealed} onRevealChange={setPasswordRevealed} />
            </div>
            <label className="form-label" htmlFor="confirm-password">Xác nhận mật khẩu</label>
            <div className="form-control form-control-password">
              <LockKeyhole size={18} />
              <input id="confirm-password" type={confirmationRevealed ? 'text' : 'password'} autoComplete="new-password" placeholder="Nhập lại mật khẩu mới" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} />
              <HoldToReveal inputId="confirm-password" revealed={confirmationRevealed} onRevealChange={setConfirmationRevealed} />
            </div>
            <p className="forgot-security-note"><Check size={15} /> Dùng ít nhất 8 ký tự để tạo mật khẩu an toàn.</p>
            {error && <div className="form-api-error" role="alert">{error}</div>}
            <button className="auth-submit" disabled={submitting} type="submit">
              {submitting ? 'Đang cập nhật...' : 'Đổi mật khẩu'} {!submitting && <ArrowRight size={17} />}
            </button>
          </form>
        )}
        <p className="forgot-footer">Cần hỗ trợ? <a href="mailto:hello@stuwork.vn">Liên hệ StuWork</a></p>
      </section>
      <div className="forgot-bottom-note"><ShieldCheck size={14} /> Bảo mật tài khoản của bạn là ưu tiên hàng đầu</div>
    </main>
  )
}

export default ForgotPassword
