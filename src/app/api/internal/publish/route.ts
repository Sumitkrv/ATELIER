import { timingSafeEqual, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { publishDueContent } from "@/lib/cms-store";
import { retryPendingEnquiryEmails } from "@/lib/enquiry-email";
import { privateJson } from "@/lib/request-security";

export async function GET(request:Request){
 const secret=process.env.CRON_SECRET;
 const actual=request.headers.get("authorization")||"";
 if(!secret||!timingSafeEqual(createHash("sha256").update(actual).digest(),createHash("sha256").update(`Bearer ${secret}`).digest()))return privateJson({ok:false,error:"Unauthorized."},401);
 try{const published=await publishDueContent();if(published)revalidatePath("/","layout");const email=await retryPendingEnquiryEmails(10);return privateJson({ok:true,published,email});}
 catch{return privateJson({ok:false,error:"Scheduled work could not be completed. It is safe to retry."},503);}
}
