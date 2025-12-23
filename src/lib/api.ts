export type AdminSummary = {
  total_users: number;
  most_common_location: string;
  disease_summary: Record<string, number>;
};

export type AdminRecord = {
  user_id?: string;
  display_name?: string;
  image_url?: string;
  prediction?: string;
  timestamp?: string;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  disease?: string | null;
  confidence?: number | null;
};

export type TimeSeriesDataset = { label: string; data: number[] };
export type GroupedDataset = { label: string; data: number[] };
export type BubblePoint = {
  lat: number;
  lon: number;
  count: number;
  disease: string | null;
};

export type AdminDashboardResponse = {
  selected_date: string;
  selected_lat: string;
  selected_lon: string;
  max_date: string;

  summary: AdminSummary;
  total_records: number;

  disease_counts: Record<string, number>;
  time_series_labels: string[];
  time_series_datasets: TimeSeriesDataset[];
  heat_points: Array<[number, number, number]>;
  grouped_locations: string[];
  grouped_datasets: GroupedDataset[];
  bubble_points: BubblePoint[];
  confidence_values: number[];

  records: AdminRecord[];
  page: number;
  total_pages: number;

  weather_list?: Array<{
    time: string;
    data: Array<{ label: string; value: string }>;
  }>;
};

export async function fetchAdminDashboard(params: {
  date?: string;
  lat?: string;
  lon?: string;
  page?: number;
}): Promise<AdminDashboardResponse> {
  const sp = new URLSearchParams();
  if (params.date) sp.set("date", params.date);
  if (params.lat) sp.set("lat", params.lat);
  if (params.lon) sp.set("lon", params.lon);
  if (params.page) sp.set("page", String(params.page));

  const res = await fetch(`/api/admin/dashboard?${sp.toString()}`, {
    headers: { accept: "application/json" },
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json();
}
