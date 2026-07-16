import React from "react";
import { StyleSheet, View, Text, Image, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { theme } from "../constants/theme";

export function AuthHeader() {
  return (
    <>
      {/* Top Wavy Header */}
      <LinearGradient
        colors={["#1A3F6F", "#1A6FBB"]}
        style={styles.headerGradient}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("@/assets/images/infoagua-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>InfoÁgua</Text>
        </View>
      </LinearGradient>

      {/* SVG Wave Transition */}
      <View style={styles.waveContainer}>
        <Svg
          height="60"
          width="100%"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          style={styles.waveSvg}
        >
          <Path
            fill="#1A6FBB"
            d="M0,96L120,112C240,128,480,160,720,160C960,160,1200,128,1320,112L1440,96L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"
          />
        </Svg>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 10,
    alignItems: "center",
  },
  logoWrapper: {
    alignItems: "center",
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 28,
    fontFamily: theme.typography.fonts.bold,
    color: theme.colors.text.light,
    marginTop: 10,
    letterSpacing: 0.5,
  },
  waveContainer: {
    width: "100%",
    height: 45,
    backgroundColor: theme.colors.cardBackground,
    marginTop: -1,
  },
  waveSvg: {
    width: "100%",
    height: "100%",
  },
});
