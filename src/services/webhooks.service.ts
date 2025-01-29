import { Application } from "express";
import { RavenPayProvider } from "../provider/ravenpay";


export class WebhookService {
    public static async registerRoutes(app: Application) {
        app.post('/webhooks/ravenpay', WebhookService.handleRavenPayWebhook);
    }

    public static async handleRavenPayWebhook(req: Request, res: Response) {
        console.log(req.body);
        res.status(200).send('Webhook received');
        //further processing
    }
}   