import React from "react";
import { AdminModuleShell } from "@/components/admin/AdminModuleShell";

export default function AdminContentPage() {
  return (
    <AdminModuleShell
      moduleCode="MODULE 05"
      moduleTitle="Page & Section Content Management"
      mongoCollection="page_contents, services"
      summary="Centralized CMS for Homepage hero headings, original client promotional video and fallback poster, About Us story/mission/vision/team, Services descriptions, Our Process workflow steps, FAQs, and verified client testimonials."
      capabilities={[
        {
          title: "Homepage Hero Video, Poster & Headings",
          description:
            "Upload the original client promotional hero video, configure the fallback poster image, and edit hero headings and CTAs.",
          schemaFields: [
            "hero.eyebrow",
            "hero.heading",
            "hero.videoAsset",
            "hero.posterImage",
            "hero.primaryCta",
          ],
        },
        {
          title: "About Us, Mission, Vision & Verified Team",
          description:
            "Manage brand story paragraphs, mission/vision statements, and verified team member profiles.",
          schemaFields: [
            "sections.introduction",
            "sections.missionVision",
            "sections.teamMembers[]",
          ],
        },
        {
          title: "Services & Editable Process Stages",
          description:
            "Manage detailed service cards and customize the step-by-step workflow stages displayed on /process.",
          schemaFields: [
            "services[]",
            "sections.processSteps[]",
            "sections.whyChooseUs",
          ],
        },
        {
          title: "FAQs & Verified Testimonials",
          description:
            "Edit FAQ accordion items and publish verified client testimonials (`isVerified: true`).",
          schemaFields: [
            "sections.faqs[]",
            "sections.testimonials[]",
          ],
        },
      ]}
    />
  );
}

