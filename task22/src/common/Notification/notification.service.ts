import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import path from "node:path";

class NotificationService {
  private _client: admin.app.App;
private _serviceAccount = JSON.parse(
readFileSync(
 path.resolve(process.cwd(), "front/firebase/social-media-cfd83-firebase-adminsdk-fbsvc-9c2720fd45.json"),
  "utf8"
)
);
  constructor() {
    this._client = admin.initializeApp({
      credential: admin.credential.cert(this._serviceAccount),
    });
  }
  async sendNotification({
    token,
    data,
  }: {
    token: string;
    data: { title: string; body: string };
  }) {
    return this._client.messaging().send({ token, data });
  }
  async sendNotifications({
    tokens,
    data,
  }: {
    tokens: string[];
    data: { title: string; body: string };
  }) {
     return await Promise.all(
      tokens.map((token) => {
        return this._client.messaging().send({ token, data });
      }),
    );
  }
}
export default new NotificationService()