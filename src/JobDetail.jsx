import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, Building2, CalendarDays, CircleDollarSign, MapPin, UsersRound } from 'lucide-react'
import { requestApiJson } from './api.js'
import { getJobById } from './jobsData.js'

function JobDetail({ jobId, currentUser, onBack, onLogin, onEditProfile, onNotice, onApplicationsChanged }) {
    const job = getJobById(jobId)
    const accessToken = currentUser?.accessToken
    const isSeeker = currentUser?.role === 'seeker'
    const [availability, setAvailability] = useState(null)
    const [coverLetter, setCoverLetter] = useState('')
    const [applyError, setApplyError] = useState('')
    const [busy, setBusy] = useState(false)

    // lấy số slot còn lại (và trạng thái ứng tuyển của người đang đăng nhập) từ server
    const loadAvailability = useCallback(async () => {
        try {
            setAvailability(await requestApiJson(`/api/jobs/${jobId}/availability`, { accessToken }))
        } catch {
            setAvailability(null)
        }
    }, [jobId, accessToken])

    useEffect(() => {
        let cancelled = false
        requestApiJson(`/api/jobs/${jobId}/availability`, { accessToken })
            .then((result) => { if (!cancelled) setAvailability(result) })
            .catch(() => { if (!cancelled) setAvailability(null) })
        return () => { cancelled = true }
    }, [jobId, accessToken])

    const handleApply = async () => {
        setApplyError('')
        setBusy(true)
        try {
            const result = await requestApiJson(`/api/jobs/${jobId}/apply`, {
                method: 'POST',
                body: { coverLetter },
                accessToken,
            })
            setAvailability(result.availability)
            setCoverLetter('')
            onNotice('Ứng tuyển thành công!')
            onApplicationsChanged()
        } catch (error) {
            setApplyError(error.message)
            loadAvailability() // slot có thể vừa hết, tải lại để hiển thị đúng
        } finally {
            setBusy(false)
        }
    }

    const handleWithdraw = async () => {
        setApplyError('')
        setBusy(true)
        try {
            await requestApiJson(`/api/applications/${availability.application.id}`, { method: 'DELETE', accessToken })
            onNotice('Đã rút đơn ứng tuyển.')
            onApplicationsChanged()
            await loadAvailability()
        } catch (error) {
            setApplyError(error.message)
        } finally {
            setBusy(false)
        }
    }

    // trg hợp ko tìm thấy công việc (id sai, tin xóa,...)
    if (!job) {
        return (
            <main className="section job-detail">
                <div className="page-shell">
                    <div className="empty-jobs">
                        <strong>Không tìm thấy công việc</strong>
                        <p>Tin tuyển dụng này không tồn tại hoặc đã bị gỡ.</p>
                        <button className="button button-primary" type="button" onClick={onBack}>
                            Về trang chủ
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    // các dòng thông tin ở khung bên phải (số lượng tuyển nằm ở đây)
    const facts = [
        { icon: UsersRound, label: 'Số lượng tuyển', value: availability ? `Còn ${availability.remaining}/${availability.slots} slot` : `${job.slots} người` },
        { icon: CircleDollarSign, label: 'Mức lương', value: job.salary },
        { icon: MapPin, label: 'Địa điểm', value: job.location },
        { icon: BriefcaseBusiness, label: 'Hình thức', value: job.type },
        { icon: CalendarDays, label: 'Hạn nộp hồ sơ', value: job.deadline },
    ]

    return (
        <main className="section job-detail">
            <div className="page-shell">
                <button className="back-link" type="button" onClick={onBack}>
                    <ArrowLeft size={16} /> Quay lại
                </button>

                <div className="job-detail-layout">
                    <article className="job-detail-main">
                        <header className="job-detail-header">
                            <div className={`company-logo logo-${job.tone}`}>{job.logo}</div>
                            <div>
                                <h1>{job.title}</h1>
                                <div className="job-company">
                                    <Building2 size={15} />
                                    {job.company}
                                    <BadgeCheck size={14} className="verified-icon" />
                                </div>
                            </div>
                        </header>

                        <section>
                            <h2>Mô tả công việc</h2>
                            <p>{job.description}</p>
                        </section>

                        <section>
                            <h2>Yêu cầu ứng viên</h2>
                            <ul>
                                {job.requirements.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>

                        <section>
                            <h2>Quyền lợi</h2>
                            <ul>
                                {job.benefits.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </section>
                    </article>

                    <aside className="job-detail-side">
                        <ul className="job-facts">
                            {facts.map(({ icon: Icon, label, value }) => (
                                <li key={label}>
                                    <span className="fact-icon"><Icon size={17} /></span>
                                    <span>
                                        <small>{label}</small>
                                        <strong>{value}</strong>
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <div className="apply-box">
                            {!currentUser && (
                                <button className="button button-primary apply-main" type="button" onClick={onLogin}>
                                    Đăng nhập để ứng tuyển
                                </button>
                            )}
                            {currentUser && !isSeeker && (
                                <p className="apply-note">Tài khoản hỗ trợ không thể ứng tuyển.</p>
                            )}
                            {isSeeker && availability?.application && (
                                <>
                                    <p className="apply-status apply-status-done">Bạn đã ứng tuyển công việc này.</p>
                                    <button className="button button-outline apply-main" type="button" disabled={busy} onClick={handleWithdraw}>
                                        Rút đơn ứng tuyển
                                    </button>
                                </>
                            )}
                            {isSeeker && availability && !availability.application && (
                                availability.expired ? (
                                    <button className="button button-primary apply-main" type="button" disabled>Đã hết hạn nộp hồ sơ</button>
                                ) : availability.remaining === 0 ? (
                                    <button className="button button-primary apply-main" type="button" disabled>Đã hết slot</button>
                                ) : !availability.hasCv ? (
                                    <>
                                        <p className="apply-note">Bạn cần tải CV lên hồ sơ trước khi ứng tuyển.</p>
                                        <button className="button button-primary apply-main" type="button" onClick={onEditProfile}>
                                            Cập nhật hồ sơ &amp; tải CV
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <label className="apply-letter">
                                            <span>Thư giới thiệu (không bắt buộc)</span>
                                            <textarea
                                                rows="4"
                                                maxLength="2000"
                                                value={coverLetter}
                                                onChange={(event) => setCoverLetter(event.target.value)}
                                            />
                                        </label>
                                        <button className="button button-primary apply-main" type="button" disabled={busy} onClick={handleApply}>
                                            {busy ? 'Đang gửi...' : 'Ứng tuyển ngay'}
                                        </button>
                                        <p className="apply-note">Hồ sơ gửi kèm CV hiện tại trong tài khoản của bạn.</p>
                                    </>
                                )
                            )}
                            {applyError && <p className="contact-form-error" role="alert">{applyError}</p>}
                        </div>
                    </aside>
                </div>
            </div>
        </main>
    )
}

export default JobDetail