import useTitle from "../hooks/useTitle";
import Title from "../ui/Title";

const Profile = () => {
  useTitle("Profile");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4">
        <Title
          title="Profile Management"
          subtitle="View system activities and operation logs"
        />
      </div>
    </div>
  );
};

export default Profile;
