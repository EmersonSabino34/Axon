// Datas em português de Portugal, sempre no fuso de Lisboa (igual no servidor e no navegador).
const TIME_ZONE = "Europe/Lisbon";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: TIME_ZONE });
const shortFormatter = new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TIME_ZONE });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TIME_ZONE,
});
const dayMonthFormatter = new Intl.DateTimeFormat("pt-PT", { day: "numeric", month: "short", timeZone: "UTC" });

export const formatDate = (iso: string) => dateFormatter.format(new Date(iso));
export const formatToday = () => dateFormatter.format(new Date());
export const formatShortDate = (iso: string) => shortFormatter.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFormatter.format(new Date(iso));
/** Para chaves de dia "AAAA-MM-DD" (em UTC). */
export const formatDayMonth = (day: string) => dayMonthFormatter.format(new Date(`${day}T00:00:00Z`)).replace(".", "");
