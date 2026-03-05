/**
 * Gera link para adicionar evento ao Outlook Web.
 */
export const useCalendarLinks = () => {
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

  return { outlookCalendarUrl }
}
