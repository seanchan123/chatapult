// src/app/dashboard/page.tsx
'use client'; // Since we're using hooks like useContext

const Home: React.FC = () => {

  return (
    <div className="p-4">
      {/* Hero Section */}
      <h1 className="text-2xl font-semibold">Welcome to your Dashboard</h1>
    </div>
  );
};

export default Home;