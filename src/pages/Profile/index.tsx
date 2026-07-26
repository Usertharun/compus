import { useState } from "react";
import { USER_PROFILE_DATA } from "@/data/profileMockData";
import { FullUserProfile } from "@/components/profile/types";
import {
  ProfileHeader,
  ProfileBioSection,
  SkillsSection,
  BadgesSection,
  AchievementsSection,
  CommunitiesJoinedSection,
  UpcomingEventsSection,
  EditProfileModal,
} from "@/components/profile";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const [user, setUser] = useState<FullUserProfile>(USER_PROFILE_DATA);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveProfile = (updated: Partial<FullUserProfile>) => {
    setUser((prev) => ({ ...prev, ...updated }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* 1. Header (Cover, Avatar, Name, Dept, Year, Action Buttons) */}
      <ProfileHeader
        user={user}
        onEditProfile={() => setIsEditModalOpen(true)}
        onOpenSettings={() => setIsEditModalOpen(true)}
      />

      {/* 2. Bio & Analytics Stats */}
      <ProfileBioSection user={user} />

      {/* 3. Skills with Progress Bars */}
      <SkillsSection skills={user.skills} />

      {/* 4. Earned Badges */}
      <BadgesSection badges={user.badges} />

      {/* 5. Campus Milestones & Achievements (Progress Bars) */}
      <AchievementsSection achievements={user.achievements} />

      {/* 6. Communities Joined & 7. Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunitiesJoinedSection communities={user.communities} />
        <UpcomingEventsSection events={user.events} />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        user={user}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </motion.div>
  );
}