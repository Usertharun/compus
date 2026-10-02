import { ProfilePortfolio } from "@/components/profile/ProfilePortfolio";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FullUserProfile } from "@/components/profile/types";
import { ProfileHeader, ProfileBioSection, AchievementsSection, CommunitiesJoinedSection, UpcomingEventsSection, EditProfileModal } from "@/components/profile";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useToast } from "@/context/ToastContext";
import { uploadImage } from "@/services/uploads";
import { avatar } from "@/services/models";
export default function ProfilePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user: appUser, profile, communities, events, updateUser } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editModalTab, setEditModalTab] = useState<"info" | "photos" | "links">(
    "info",
  );
  const displayUser: FullUserProfile = useMemo(
    () => ({
      name: appUser.name,
      department: appUser.major,
      year: appUser.gradYear,
      avatar: appUser.avatar,
      banner: appUser.banner || "",
      bio: appUser.bio,
      campus: appUser.university,
      statusText: appUser.location,
      githubUrl: appUser.githubUrl || "",
      linkedinUrl: appUser.linkedinUrl || "",
      portfolioUrl: appUser.portfolioUrl || "",
      profileViews: profile?.metrics?.viewsCount || 0,
      connectionsCount: profile?.metrics?.followersCount || 0,
      projectsCount: profile?.projects?.length || 0,
      skills: (profile?.skills || []).map((s) => ({
        name: s.skill.name,
        level: 0,
        category: "Systems",
      })),
      badges: [],
      achievements: (profile?.achievements || []).map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        current: 1,
        max: 1,
        iconName: "Trophy",
        color: "text-primary",
      })),
      communities: communities
        .filter((c) => c.userRole)
        .map((c) => ({
          id: c.id,
          name: c.name,
          role: c.userRole || "Member",
          avatar: avatar(c.name, c.avatarUrl),
          category: c.category,
          membersCount: c.memberCount,
        })),
      events: events
        .filter((e) => e.isRegistered)
        .map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time || "",
          location: e.venue,
          status: "Registered",
        })),
    }),
    [appUser, profile, communities, events],
  );
  const handleSaveProfile = async (updated: Partial<FullUserProfile>) => {
    const saved = await updateUser({
      name: updated.name,
      major: updated.department,
      gradYear: updated.year,
      avatar: updated.avatar,
      banner: updated.banner,
      bio: updated.bio,
      location: updated.statusText,
      githubUrl: updated.githubUrl,
      linkedinUrl: updated.linkedinUrl,
      portfolioUrl: updated.portfolioUrl,
    });
    if (saved) toast.success("Profile saved.");
    return saved;
  };
  const handleDirectPhotoUpload = async (file: File) => {
    try {
      const url = await uploadImage(file);
      await handleSaveProfile({ avatar: url });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 max-w-7xl mx-auto pb-12"
    >
      <ProfileHeader
        user={displayUser}
        onEditProfile={(tab) => {
          setEditModalTab(tab || "info");
          setIsEditModalOpen(true);
        }}
        onOpenSettings={() => navigate("/settings")}
        onDirectPhotoUpload={handleDirectPhotoUpload}
      />
      <ProfileBioSection user={displayUser} />
      <ProfilePortfolio />

      <AchievementsSection achievements={displayUser.achievements} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunitiesJoinedSection communities={displayUser.communities} />
        <UpcomingEventsSection events={displayUser.events} />
      </div>
      <EditProfileModal
        isOpen={isEditModalOpen}
        user={displayUser}
        defaultTab={editModalTab}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </motion.div>
  );
}
