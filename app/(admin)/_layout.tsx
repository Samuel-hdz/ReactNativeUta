import { Stack } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "expo-router";
import { RootState } from "../store/store";

const AdminLayout = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("../");
    }
  }, [isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Admin Dashboard" }} />
    </Stack>
  );
};

export default AdminLayout;
