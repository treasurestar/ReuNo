/**
 * Gera links para adicionar evento ao Google Calendar e Outlook Web.
 */
export const useCalendarLinks = () => {
  const formatDateTime = (date: string, time: string): string => {
    // date: "2026-03-15", time: "14:00" → "20260315T140000"
    return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '').padEnd(6, '0')
  }

  const googleCalendarUrl = (opts: {
    title: string
    date: string
    startTime: string
    endTime: string
    description?: string
  }): string => {
    const start = formatDateTime(opts.date, opts.startTime)
    const end = formatDateTime(opts.date, opts.endTime)
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: opts.title,
      dates: `${start}/${end}`,
    })
    if (opts.description) params.set('details', opts.description)
    return `https://calendar.google.com/calendar/event?${params.toString()}`
  }

  const outlookCalendarUrl = (opts: {
    title: string
    date: string
    startTime: string
    endTime: string
    description?: string
  }): string => {
    // Outlook Web deep link format
    const startdt = `${opts.date}T${opts.startTime.padEnd(5, '0')}:00`
    const enddt = `${opts.date}T${opts.endTime.padEnd(5, '0')}:00`
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: opts.title,
      startdt,
      enddt,
    })
    if (opts.description) params.set('body', opts.description)
    return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`
  }

  return { googleCalendarUrl, outlookCalendarUrl }
}
