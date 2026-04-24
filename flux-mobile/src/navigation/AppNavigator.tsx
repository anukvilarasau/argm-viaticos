import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { DailyCanvasScreen } from "../screens/DailyCanvasScreen";
import { InsightsScreen } from "../screens/InsightsScreen";
import { appTheme } from "../theme";

export type RootTabParamList = {
  Canvas: undefined;
  Insights: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: appTheme.colors.accent,
        tabBarInactiveTintColor: appTheme.colors.muted,
        tabBarStyle: {
          position: "absolute",
          left: 18,
          right: 18,
          bottom: 18,
          height: 78,
          borderRadius: 28,
          borderTopWidth: 0,
          backgroundColor: "rgba(255,255,255,0.95)",
          paddingBottom: 12,
          paddingTop: 12,
          elevation: 0,
          shadowColor: "#17181C",
          shadowOpacity: 0.08,
          shadowRadius: 22,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter_500Medium",
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconName =
            route.name === "Canvas" ? (focused ? "grid" : "square") : focused ? "pie-chart" : "activity";

          return <Feather color={color} name={iconName} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Canvas" component={DailyCanvasScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
}
