import { formatDistanceToNow, format } from "date-fns";

export function timeAgo(iso: string) {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

export function fullDate(iso: string) {
  return format(new Date(iso), "d MMM yyyy, h:mm a");
}

export function shortDate(iso: string) {
  return format(new Date(iso), "d MMM yyyy");
}
