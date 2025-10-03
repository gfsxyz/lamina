import DataTab from "@/components/DataTab";
import Navbar from "@/components/Navbar";
import Overview from "@/components/Overview";
import ProfileHeader from "@/components/ProfileHeader";

export default function Home() {
  return (
    <>
      <Navbar />
      <ProfileHeader />

      <main>
        <DataTab />
        <Overview />
      </main>
    </>
  );
}
