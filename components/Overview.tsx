import Wallet from "./overview/Wallet";

const Overview = () => {
  return (
    <div className="wrapper py-4 grid grid-cols-2 gap-4">
      <Wallet />
      <div>Activity</div>
    </div>
  );
};
export default Overview;
