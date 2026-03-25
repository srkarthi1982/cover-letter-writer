export type DashboardSummaryPayload = {
  appId: "cover-letter-writer";
  userId: string;
  summary: {
    totalLetters: number;
    readyLetters: number;
    favoriteLetters: number;
    mostRecentlyUpdatedTitle: string | null;
  };
};

export type NotificationPayload = {
  appId: "cover-letter-writer";
  userId: string;
  type: "first-letter" | "first-favorite" | "first-ready";
  title: string;
  message: string;
};

const dashboardWebhookUrl = import.meta.env.ANSIVERSA_DASHBOARD_WEBHOOK_URL;
const notificationsWebhookUrl = import.meta.env.ANSIVERSA_NOTIFICATIONS_WEBHOOK_URL;

async function postJson(url: string | undefined, body: unknown) {
  if (!url) return;

  try {
    await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    console.warn("Integration webhook failed", error);
  }
}

export async function pushDashboardSummary(payload: DashboardSummaryPayload) {
  await postJson(dashboardWebhookUrl, payload);
}

export async function sendHighSignalNotification(payload: NotificationPayload) {
  await postJson(notificationsWebhookUrl, payload);
}
