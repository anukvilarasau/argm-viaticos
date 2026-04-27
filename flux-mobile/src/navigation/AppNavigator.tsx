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
          display: "none",
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
      <Tab.Screen name="Canvas" component={InsightsScreen} />
      <Tab.Screen name="Insights" component={DailyCanvasScreen} />
    </Tab.Navigator>
  );
}
