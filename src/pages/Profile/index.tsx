import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { useApp } from "@/context/AppContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user: appUser, updateUser: updateAppUser } = useApp();
  const [profileData, setProfileData] = useState<FullUserProfile>(USER_PROFILE_DATA);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const displayUser = useMemo(() => {
    return {
      ...profileData,
      name: appUser.name || profileData.name,
      department: appUser.major || profileData.department,
      year: appUser.gradYear ? `Class of '${appUser.gradYear.slice(-2)}` : profileData.year,
      avatar: appUser.avatar || profileData.avatar,
      bio: appUser.bio || profileData.bio,
    };
  }, [profileData, appUser]);

  const handleSaveProfile = (updated: Partial<FullUserProfile>) => {
    setProfileData((prev) => ({ ...prev, ...updated }));
    updateAppUser({
      name: updated.name,
      major: updated.department,
      gradYear: updated.year,
      avatar: updated.avatar,
      bio: updated.bio,
    });
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
        user={displayUser}
        onEditProfile={() => setIsEditModalOpen(true)}
        onOpenSettings={() => navigate("/settings")}
      />

      {/* 2. Bio & Analytics Stats */}
      <ProfileBioSection user={displayUser} />

      {/* 3. Skills with Progress Bars */}
      <SkillsSection skills={displayUser.skills} />

      {/* 4. Earned Badges */}
      <BadgesSection badges={displayUser.badges} />

      {/* 5. Campus Milestones & Achievements (Progress Bars) */}
      <AchievementsSection achievements={displayUser.achievements} />

      {/* 6. Communities Joined & 7. Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CommunitiesJoinedSection communities={displayUser.communities} />
        <UpcomingEventsSection events={displayUser.events} />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        user={displayUser}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfile}
      />
    </motion.div>
  );
}