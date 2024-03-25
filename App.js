import React, { useState, useEffect, useRef } from 'react';
import { Dimensions, ScrollView, View, Text, StyleSheet, TouchableOpacity, TextInput, ImageBackground, Alert, Button, FlatList, Image, PanResponder } from 'react-native';
import MapView, { Marker, LatLng, Callout, CalloutSubview } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import axios from 'axios';
import { Camera, CameraType } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { LineChart, BarChart, PieChart, ProgressChart, ContributionGraph, StackedBarChart } from "react-native-chart-kit";

import snowyBackground from './assets/snowy.jpg';
import rainyBackground from './assets/rainy.png';
import thunderBackground from './assets/thunder.jpg';
import clearDayBackground from './assets/clearday.jpg';
import clearNightBackground from './assets/clearnight.png';
import cloudyDayBackground from './assets/cloudyday.png';
import cloudyNightBackground from './assets/cloudynight.jpg';

const API_KEY = '';

const App = () => {
  const [currentView, setCurrentView] = useState(1);
  const [currentLocationData, setCurrentLocationData] = useState(null);
  const [searchedLocationData, setSearchedLocationData] = useState(null);
  const [graphdata, setgraphdata] = useState(null);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [latpos, setlatpos] = useState(null);
  const [longpos, setlongpos] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);

  const forecastdays = 7;

  const handleButtonPress = (viewNumber) => {
    setCurrentView(viewNumber);
  };

  useEffect(() => {
    getLocation();
    (async () => {
      MediaLibrary.requestPermissionsAsync();
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
    })();
  }, []);

  const CustomButton = ({ title, onPress, isSelected }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: isSelected ? 'white' : 'azure',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <Text>{title}</Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    scrollViewContainer: {
      flexGrow: 1,
    },
    scrollViewContent: {
      paddingHorizontal: 10,
    },
    item: {
      width: 100,
      height: 140,
      marginHorizontal: 5,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      borderColor: 'gray',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderRadius: 10,
      padding: 10,
    },
    time: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    icon: {
      width: 50,
      height: 50
    },
    minitemp: {
      fontSize: 16,
    },
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    marker: {
      width: 20,
      height: 20,
      backgroundColor: 'red',
      borderRadius: 10,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 40,
      color: 'white',
    },
    subHeading: {
      fontSize: 16,
      marginBottom: 50,
      color: 'white',
    },
    searchButton: {
      position: 'absolute',
      top: 150,
      right: 10,
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
    },
    submitButton: {
      backgroundColor: 'blue',
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginBottom: 10,
      paddingLeft: 10,
      width: '100%',
      color: 'white',
    },
    city: {
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 0,
      marginBottom: 10,
      color: 'white',
      textAlign: 'center'
    },
    temperature: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: 'white',
      textAlign: 'center'
    },
    weather: {
      fontSize: 18,
      textTransform: 'capitalize',
      color: 'white',
      textAlign: 'center'
    },
    weatherInfoContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 20,
    },
    infoBox: {
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      padding: 10,
      margin: 5,
      minWidth: 150,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      elevation: 2,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
    },
    mapsearchbox: {
      borderWidth: 1,
      borderColor: 'blue',
      borderRadius: 5,
      padding: 10,
      margin: 5,
      width: 'auto',
      backgroundColor: 'azure',
      elevation: 2,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowOffset: { width: 0, height: 2 },
    },
    infoTitle: {
      fontWeight: 'bold',
      marginBottom: 5,
      textAlign: 'center'
    },
    infoValue: { textAlign: 'center' },
    backgroundImage: {
      flex: 1,
      resizeMode: 'cover',
      justifyContent: 'center',
    },
    forecastbox: {
      borderWidth: 1,
      borderColor: 'gray',
      borderRadius: 5,
      padding: 10,
      minWidth: '80%',
      height: 40,
      marginBottom: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      flexDirection: 'row',
      alignItems: 'center'
    },
    forecastday: {
      fontWeight: 'bold',
      textAlign: 'left',
      flex: 1
    },
    forecasttemp: { flex: 1, textAlign: 'right', overflow: 'hidden' },
    forecasticon: {
      width: 25,
      height: 25, 
      flex: 1,
      alignContent: 'center'
    },
    camera: {
      flex: 1,
      borderRadius: 20,
    },
  });
  
  const getLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Error', 'Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setlatpos(location.coords.latitude);
      setlongpos(location.coords.longitude);
      getWeatherData(location.coords.latitude, location.coords.longitude, true);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const getWeatherData = async (latitude, longitude, isCurrentLocation) => {
    try {
      const response = await axios.get('http://api.weatherapi.com/v1/forecast.json?key=' + API_KEY + '&q=' + latitude + ',' + longitude + '&days=' + forecastdays + '&aqi=yes&alerts=no');
      if (response.status == 200) {
        if (isCurrentLocation) {
          setCurrentLocationData(response.data);
          setSearchedLocationData(null);
        } else {
          setSearchedLocationData(response.data);
        }
      } else {
        console.log(response.status);
        Alert.alert('Error', 'An Error Occured, Please Try Again Later!');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };
  
  const getWeatherDataByCity = async (city) => {
    try {
      const response = await axios.get('http://api.weatherapi.com/v1/forecast.json?key=' + API_KEY + '&q=' + latitude + ',' + longitude + '&days=' + forecastdays + '&aqi=yes&alerts=no');
      setSearchedLocationData(response.data);
    } catch (error) {
      Alert.alert('Error', 'Could not find weather data for the specified location');
      console.error('Error fetching weather data:', error);
    }
  };

  function getDayFromDate(dateString) {
    const date = new Date(dateString);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
  }

  const handleSearch = () => {
    setSearchVisible(true);
  };

  const handleSearchSubmit = () => {
    if (!searchQuery) {
      setSearchedLocationData(null);
      setSearchVisible(false);
      return;
    }
  
    getWeatherDataByCity(searchQuery);
    setSearchVisible(false);
  };

  const renderWeatherInfoBox = (title, value) => {
    if ((title.toLowerCase() === "sunrise") || (title.toLowerCase() === "sunset") || (title.toLowerCase() === "moonrise") || (title.toLowerCase() === "moon phase")) {
      return (
        <TouchableOpacity onPress={() => handleButtonPress(title)} style={styles.infoBox} disabled>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value !== undefined ? value : 'N/A'}</Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => handleButtonPress(title)} style={styles.infoBox}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value !== undefined ? value : 'N/A'}</Text>
        </TouchableOpacity>
      );
    }
    
  };

  const rendermapsearchbox = (title, value) => {
      return (
        <TouchableOpacity onPress={() => handleButtonPress(3)} style={styles.mapsearchbox}>
          <Text style={styles.infoTitle}>{title}</Text>
          <Text style={styles.infoValue}>{value !== undefined ? value : 'N/A'}</Text>
        </TouchableOpacity>
      );
  };

  const renderforecastbox = (title, img, value) => {
    return (
      <View style={styles.forecastbox}>
        <Text style={styles.forecastday}>{title}</Text>
        <Image source={{ uri: img }} style={styles.icon} />
        <Text style={styles.forecasttemp}>{value}</Text>
      </View>
    );
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const getBackgroundImage = () => {
    const weatherData = searchedLocationData || currentLocationData;

    if (!weatherData) {
      return clearDayBackground;
    }

    const weather = weatherData.current.condition.text.toLowerCase();
    if (weather.includes('snow')) {
      return snowyBackground;
    } else if ((weather.includes('rain')) || (weather.includes('drizzle'))) {
      return rainyBackground;
    } else if (weather.includes('thunderstorm')) {
      return thunderBackground;
    } else if (weather.includes('clear')) {
      if (weatherData.current.is_day == 0) {
        return clearNightBackground;
      } else {
        return clearDayBackground;
      }
    } else if ((weather.includes('cloud')) || (weather.includes('overcast'))) {
      if (weatherData.current.is_day == 0) {
        return cloudyNightBackground;
      } else {
        return cloudyDayBackground;
      }
    } else {
      return clearDayBackground;
    }
  };

  const formatdirection = (direction) => {
    if (direction == 'N') {
      return 'North';
    } else if (direction == 'NE') {
      return 'North-East';
    } else if (direction == 'E') {
      return 'East';
    } else if (direction == 'SE') {
      return 'South-East';
    } else if (direction == 'S') {
      return 'South';
    } else if (direction == 'SW') {
      return 'South-West';
    } else if (direction == 'W') {
      return 'West';
    } else if (direction == 'NW') {
      return 'North-West';
    } else {
      return direction;
    }
  };

  const hourlyData = Array.from({ length: 24 }, (_, index) => {
    const hour = currentLocationData?.forecast?.forecastday[0]?.hour[index];
    if (hour) {
      return {
        time: `${index % 12 || 12} ${index < 12 ? 'AM' : 'PM'}`,
        icon: `http:${hour.condition.icon}`,
        temperature: `${hour.temp_c}°C`
      };
    } else {
      return null;
    }
  }).filter(Boolean);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.time}>{item.time}</Text>
      <Image source={{ uri: item.icon }} style={styles.icon} />
      <Text style={styles.minitemp}>{item.temperature}</Text>
    </View>
  );
  
  const isValueAvailable = (value) => {
    return value !== undefined && value !== null;
  };

  const forecastday1 = currentLocationData?.forecast?.forecastday[0]?.day;
  const forecastday2 = currentLocationData?.forecast?.forecastday[1]?.day;
  const forecastday3 = currentLocationData?.forecast?.forecastday[2]?.day;
  const forecastday4 = currentLocationData?.forecast?.forecastday[3]?.day;
  const forecastday5 = currentLocationData?.forecast?.forecastday[4]?.day;
  const forecastday6 = currentLocationData?.forecast?.forecastday[5]?.day;
  const forecastday7 = currentLocationData?.forecast?.forecastday[6]?.day;

  const astro = currentLocationData?.forecast?.forecastday[0]?.astro;

  const renderMiddleView = () => {
    if (currentView == 1) {
        return (
          <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <ImageBackground source={getBackgroundImage()} style={styles.backgroundImage}>
            <View style={styles.container}>

              {currentLocationData && (
                <View>
                  <Text style={styles.city}>{currentLocationData.location.name}, {currentLocationData.location.region}</Text>
                  <Text style={styles.city}>{currentLocationData.location.country}</Text>
                  <Text style={styles.temperature}>{currentLocationData.current.temp_c} °C | {currentLocationData.current.temp_f} °F</Text>
                  <Text style={styles.weather}>{capitalizeFirstLetter(currentLocationData.current.condition.text)}</Text>
                  <Text style={styles.weather}>Current Time: {currentLocationData.location.localtime}</Text>
                  <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                  <Text style={{ marginTop: 5, marginBottom: 10, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Hourly Weather:</Text>
                  <FlatList
                    data={hourlyData}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    contentContainerStyle={styles.scrollViewContent}
                  />
                  <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                  <Text style={{ marginTop: 5, marginBottom: 10, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>{forecastdays} Day Forecast:</Text>
                  {renderforecastbox('Today', 'http:' + forecastday1.condition.icon, 'H: ' + forecastday1.maxtemp_c + ', L: ' + forecastday1.mintemp_c)}
                  {renderforecastbox(getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date), 'http:' + forecastday2.condition.icon, 'H: ' + forecastday2.maxtemp_c + ', L: ' + forecastday2.mintemp_c)}
                  {renderforecastbox(getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date), 'http:' + forecastday3.condition.icon, 'H: ' + forecastday3.maxtemp_c + ', L: ' + forecastday3.mintemp_c)}
                  {renderforecastbox(getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date), 'http:' + forecastday4.condition.icon, 'H: ' + forecastday4.maxtemp_c + ', L: ' + forecastday4.mintemp_c)}
                  {renderforecastbox(getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date), 'http:' + forecastday5.condition.icon, 'H: ' + forecastday5.maxtemp_c + ', L: ' + forecastday5.mintemp_c)}
                  {renderforecastbox(getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date), 'http:' + forecastday6.condition.icon, 'H: ' + forecastday6.maxtemp_c + ', L: ' + forecastday6.mintemp_c)}
                  {renderforecastbox(getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date), 'http:' + forecastday7.condition.icon, 'H: ' + forecastday7.maxtemp_c + ', L: ' + forecastday7.mintemp_c)}
                  <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                  <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Statistics:</Text>
                  <View style={styles.weatherInfoContainer}>
                    {renderWeatherInfoBox('Precipitation', `${currentLocationData.current.precip_in} inches`)}
                    {renderWeatherInfoBox('Feels Like', `${currentLocationData.current.feelslike_c}°C | ${currentLocationData.current.feelslike_f}°F`)}
                    {renderWeatherInfoBox('Visibility', `${currentLocationData.current.vis_km} Km`)}
                    {renderWeatherInfoBox('Chance Of Rain', `${forecastday1.daily_chance_of_rain}%`)}
                    {renderWeatherInfoBox('Chance Of Snow', `${forecastday1.daily_chance_of_snow}%`)}
                    {renderWeatherInfoBox('Humidity', `${currentLocationData.current.humidity} g/m3`)}
                    {renderWeatherInfoBox('UV Index', currentLocationData.current.uv)}
                    {renderWeatherInfoBox('Pressure', `${currentLocationData.current.pressure_mb} mb`)}
                    {renderWeatherInfoBox('Cloud', `${currentLocationData.current.cloud}%`)}
                  </View>
                  <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                  <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Wind Data:</Text>
                  <View style={styles.weatherInfoContainer}>
                    {renderWeatherInfoBox('Wind Speed', `${currentLocationData.current.wind_kph} Km/h`)}
                    {renderWeatherInfoBox('Wind Direction', formatdirection(currentLocationData.current.wind_dir))}
                    {renderWeatherInfoBox('Gust Speed', `${currentLocationData.current.gust_kph} Km/h`)}
                  </View>
                  <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                  <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Air Quality:</Text>
                  <View style={styles.weatherInfoContainer}>
                    {renderWeatherInfoBox('CO Level', `${currentLocationData.current.air_quality.co}`)}
                    {renderWeatherInfoBox('NO2 Level', `${currentLocationData.current.air_quality.no2}`)}
                    {renderWeatherInfoBox('O3 Level', `${currentLocationData.current.air_quality.o3}`)}
                    {renderWeatherInfoBox('SO2 Level', `${currentLocationData.current.air_quality.so2}`)}
                    {renderWeatherInfoBox('PM2.5 Level', `${currentLocationData.current.air_quality.pm2_5}`)}
                    {renderWeatherInfoBox('PM10 Level', `${currentLocationData.current.air_quality.pm10}`)}
                    {renderWeatherInfoBox('USEPA Index', 17.0)}
                    {renderWeatherInfoBox('GBDEFRA Index', 12.21)}
                  </View>
                  <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                  <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Astronomy:</Text>
                  <View style={styles.weatherInfoContainer}>
                    {renderWeatherInfoBox('Sunrise', `${astro.sunrise}`)}
                    {renderWeatherInfoBox('Sunset', `${astro.sunset}`)}
                    {renderWeatherInfoBox('Moonrise', `${astro.moonrise}`)}
                    {renderWeatherInfoBox('Moon Phase', `${astro.moon_phase}`)}
                  </View>
                </View>
              )}
            </View>
          </ImageBackground>
        </ScrollView>
        );
    } else if (currentView == 2) {
      const handleMapPress = (event) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setMarkerPosition({ latitude, longitude });
        handleButtonPress("coords: " + latitude + ", " + longitude);
      };
      
      return (
        <MapView style={{ flex: 1 }} initialRegion={{ latitude: latpos, longitude: longpos, latitudeDelta: 0.0922, longitudeDelta: 0.0421 }} onPress={handleMapPress}>
          {markerPosition && (
          <Marker coordinate={markerPosition} pinColor="red">
            <Callout>
              {rendermapsearchbox(searchedLocationData?.location?.name + ', ' + searchedLocationData?.location?.region + ', ' + searchedLocationData?.location?.country, searchedLocationData?.current?.temp_c + '°C | ' + searchedLocationData?.current?.temp_f + '°F')}
            </Callout>
          </Marker>
        )}
        </MapView>
      );
    } else if (currentView == 3) {
        return(
          <Camera style={styles.camera} type={type} flashMode={flash} ref={cameraRef}>
          </Camera>
          );
    } else if (currentView == 4) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><Text>View 4</Text></View>;
    } else {
        if ((currentView.toLowerCase() === "precipitation") || (currentView.toLowerCase() === "chance of rain")) {
          const hourlyprecip12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].precip_in;
          const hourlyprecip3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].precip_in;
          const hourlyprecip6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].precip_in;
          const hourlyprecip9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].precip_in;
          const hourlyprecip12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].precip_in;
          const hourlyprecip3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].precip_in;
          const hourlyprecip6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].precip_in;
          const hourlyprecip9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].precip_in;

          const hourlyprecipc12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].chance_of_rain;
          const hourlyprecipc3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].chance_of_rain;
          const hourlyprecipc6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].chance_of_rain;
          const hourlyprecipc9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].chance_of_rain;
          const hourlyprecipc12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].chance_of_rain;
          const hourlyprecipc3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].chance_of_rain;
          const hourlyprecipc6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].chance_of_rain;
          const hourlyprecipc9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].chance_of_rain;

          const dailyprecip0 = currentLocationData?.forecast?.forecastday[0]?.day.totalprecip_in;
          const dailyprecip1 = currentLocationData?.forecast?.forecastday[1]?.day.totalprecip_in;
          const dailyprecip2 = currentLocationData?.forecast?.forecastday[2]?.day.totalprecip_in;
          const dailyprecip3 = currentLocationData?.forecast?.forecastday[3]?.day.totalprecip_in;
          const dailyprecip4 = currentLocationData?.forecast?.forecastday[4]?.day.totalprecip_in;
          const dailyprecip5 = currentLocationData?.forecast?.forecastday[5]?.day.totalprecip_in;
          const dailyprecip6 = currentLocationData?.forecast?.forecastday[6]?.day.totalprecip_in;

          const dailypred0 = currentLocationData?.forecast?.forecastday[0]?.day.daily_chance_of_rain;
          const dailypred1 = currentLocationData?.forecast?.forecastday[1]?.day.daily_chance_of_rain;
          const dailypred2 = currentLocationData?.forecast?.forecastday[2]?.day.daily_chance_of_rain;
          const dailypred3 = currentLocationData?.forecast?.forecastday[3]?.day.daily_chance_of_rain;
          const dailypred4 = currentLocationData?.forecast?.forecastday[4]?.day.daily_chance_of_rain;
          const dailypred5 = currentLocationData?.forecast?.forecastday[5]?.day.daily_chance_of_rain;
          const dailypred6 = currentLocationData?.forecast?.forecastday[6]?.day.daily_chance_of_rain;
          return (
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <Button title="Go back" onPress={() => handleButtonPress(1)}/>
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Rain(in) Chart Today:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        hourlyprecip12am,
                        hourlyprecip3am,
                        hourlyprecip6am,
                        hourlyprecip9am,
                        hourlyprecip12pm,
                        hourlyprecip3pm,
                        hourlyprecip6pm,
                        hourlyprecip9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="in"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              <Text style={styles.time}>Rain(in) Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailyprecip0,
                        dailyprecip1,
                        dailyprecip2,
                        dailyprecip3,
                        dailyprecip4,
                        dailyprecip5,
                        dailyprecip6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="in"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              <Text style={styles.time}>Rain Prediction Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        hourlyprecipc12am,
                        hourlyprecipc3am,
                        hourlyprecipc6am,
                        hourlyprecipc9am,
                        hourlyprecipc12pm,
                        hourlyprecipc3pm,
                        hourlyprecipc6pm,
                        hourlyprecipc9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>Rain Prediction Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailypred0,
                        dailypred1,
                        dailypred2,
                        dailypred3,
                        dailypred4,
                        dailypred5,
                        dailypred6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              <Text style={styles.time}>About:</Text>
              <Text style={styles.time}>Precipitation is a fundamental aspect of the Earth's weather system, referring to any form of water, liquid or solid, that falls from the atmosphere and reaches the Earth's surface. It plays a crucial role in the Earth's water cycle, influencing various natural processes and ecosystems. Here's a detailed overview of precipitation, its formation, and recommendations to manage and utilize it effectively:</Text>
            </View>
            </ScrollView>
          );
        } else if (currentView.toLowerCase() === "feels like") {
          const hourlytemp12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].temp_c;
          const hourlytemp3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].temp_c;
          const hourlytemp6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].temp_c;
          const hourlytemp9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].temp_c;
          const hourlytemp12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].temp_c;
          const hourlytemp3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].temp_c;
          const hourlytemp6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].temp_c;
          const hourlytemp9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].temp_c;

          const hourlyprecip12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].feelslike_c;
          const hourlyprecip3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].feelslike_c;
          const hourlyprecip6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].feelslike_c;
          const hourlyprecip9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].feelslike_c;
          const hourlyprecip12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].feelslike_c;
          const hourlyprecip3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].feelslike_c;
          const hourlyprecip6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].feelslike_c;
          const hourlyprecip9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].feelslike_c;

          const dailytemp0 = currentLocationData?.forecast?.forecastday[0]?.day.avgtemp_c;
          const dailytemp1 = currentLocationData?.forecast?.forecastday[1]?.day.avgtemp_c;
          const dailytemp2 = currentLocationData?.forecast?.forecastday[2]?.day.avgtemp_c;
          const dailytemp3 = currentLocationData?.forecast?.forecastday[3]?.day.avgtemp_c;
          const dailytemp4 = currentLocationData?.forecast?.forecastday[4]?.day.avgtemp_c;
          const dailytemp5 = currentLocationData?.forecast?.forecastday[5]?.day.avgtemp_c;
          const dailytemp6 = currentLocationData?.forecast?.forecastday[6]?.day.avgtemp_c;

          const dailyfeel0 = currentLocationData?.forecast?.forecastday[0]?.day.maxtemp_c;
          const dailyfeel1 = currentLocationData?.forecast?.forecastday[1]?.day.maxtemp_c;
          const dailyfeel2 = currentLocationData?.forecast?.forecastday[2]?.day.maxtemp_c;
          const dailyfeel3 = currentLocationData?.forecast?.forecastday[3]?.day.maxtemp_c;
          const dailyfeel4 = currentLocationData?.forecast?.forecastday[4]?.day.maxtemp_c;
          const dailyfeel5 = currentLocationData?.forecast?.forecastday[5]?.day.maxtemp_c;
          const dailyfeel6 = currentLocationData?.forecast?.forecastday[6]?.day.maxtemp_c;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Temperature Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        hourlytemp12am,
                        hourlytemp3am,
                        hourlytemp6am,
                        hourlytemp9am,
                        hourlytemp12pm,
                        hourlytemp3pm,
                        hourlytemp6pm,
                        hourlytemp9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="°C"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>Temperature Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailytemp0,
                        dailytemp1,
                        dailytemp2,
                        dailytemp3,
                        dailytemp4,
                        dailytemp5,
                        dailytemp6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="°C"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              <Text style={styles.time}>Feels Like Chart For Today:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        hourlyprecip12am,
                        hourlyprecip3am,
                        hourlyprecip6am,
                        hourlyprecip9am,
                        hourlyprecip12pm,
                        hourlyprecip3pm,
                        hourlyprecip6pm,
                        hourlyprecip9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="°C"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>Feels Like Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailyfeel0,
                        dailyfeel1,
                        dailyfeel2,
                        dailyfeel3,
                        dailyfeel4,
                        dailyfeel5,
                        dailyfeel6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="°C"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              <Text style={styles.time}>Temperature rise due to global warming poses significant threats to ecosystems, human health, and economies worldwide. To mitigate this, reducing greenhouse gas emissions, transitioning to renewable energy sources, conserving energy, promoting sustainable practices, and advocating for policies that address climate change are crucial steps to avoid further temperature escalation and its adverse effects</Text>
              </ScrollView>
            </View>
          );
        } else if (currentView.toLowerCase() === "visibility") {
          const data12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].vis_km;
          const data3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].vis_km;
          const data6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].vis_km;
          const data9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].vis_km;
          const data12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].vis_km;
          const data3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].vis_km;
          const data6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].vis_km;
          const data9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].vis_km;

          const dailyvis0 = currentLocationData?.forecast?.forecastday[0]?.day.avgvis_km;
          const dailyvis1 = currentLocationData?.forecast?.forecastday[1]?.day.avgvis_km;
          const dailyvis2 = currentLocationData?.forecast?.forecastday[2]?.day.avgvis_km;
          const dailyvis3 = currentLocationData?.forecast?.forecastday[3]?.day.avgvis_km;
          const dailyvis4 = currentLocationData?.forecast?.forecastday[4]?.day.avgvis_km;
          const dailyvis5 = currentLocationData?.forecast?.forecastday[5]?.day.avgvis_km;
          const dailyvis6 = currentLocationData?.forecast?.forecastday[6]?.day.avgvis_km;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Visibility Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        data12am,
                        data3am,
                        data6am,
                        data9am,
                        data12pm,
                        data3pm,
                        data6pm,
                        data9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="Km"
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>Visibility(Km) Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailyvis0,
                        dailyvis1,
                        dailyvis2,
                        dailyvis3,
                        dailyvis4,
                        dailyvis5,
                        dailyvis6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="km"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              <Text style={styles.time}>Visibility refers to the distance at which objects can be clearly seen in the atmosphere and is influenced by factors such as weather conditions (fog, haze, rain), air quality (pollution, dust), terrain, and lighting conditions, with measures to improve it including reducing air pollution, using proper lighting, and implementing traffic management strategies.</Text>
              </ScrollView>
            </View>
          );
        } else if (currentView.toLowerCase() === "chance of snow") {
          const data12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].chance_of_snow;
          const data3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].chance_of_snow;
          const data6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].chance_of_snow;
          const data9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].chance_of_snow;
          const data12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].chance_of_snow;
          const data3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].chance_of_snow;
          const data6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].chance_of_snow;
          const data9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].chance_of_snow;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Probability Of Snow Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        data12am,
                        data3am,
                        data6am,
                        data9am,
                        data12pm,
                        data3pm,
                        data6pm,
                        data9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              </ScrollView>
              <Text style={styles.time}></Text>
            </View>
          );
        } else if (currentView.toLowerCase() === "humidity") {
          const data12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].humidity;
          const data3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].humidity;
          const data6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].humidity;
          const data9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].humidity;
          const data12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].humidity;
          const data3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].humidity;
          const data6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].humidity;
          const data9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].humidity;

          const dailyhum0 = currentLocationData?.forecast?.forecastday[0]?.day.avghumidity;
          const dailyhum1 = currentLocationData?.forecast?.forecastday[1]?.day.avghumidity;
          const dailyhum2 = currentLocationData?.forecast?.forecastday[2]?.day.avghumidity;
          const dailyhum3 = currentLocationData?.forecast?.forecastday[3]?.day.avghumidity;
          const dailyhum4 = currentLocationData?.forecast?.forecastday[4]?.day.avghumidity;
          const dailyhum5 = currentLocationData?.forecast?.forecastday[5]?.day.avghumidity;
          const dailyhum6 = currentLocationData?.forecast?.forecastday[6]?.day.avghumidity;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Humidity Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        data12am,
                        data3am,
                        data6am,
                        data9am,
                        data12pm,
                        data3pm,
                        data6pm,
                        data9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>Humidity Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailyhum0,
                        dailyhum1,
                        dailyhum2,
                        dailyhum3,
                        dailyhum4,
                        dailyhum5,
                        dailyhum6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              </ScrollView>
              <Text style={styles.time}></Text>
            </View>
          );
        } else if (currentView.toLowerCase() === "uv index") {
          const data12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].uv;
          const data3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].uv;
          const data6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].uv;
          const data9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].uv;
          const data12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].uv;
          const data3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].uv;
          const data6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].uv;
          const data9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].uv;

          const dailyuv0 = currentLocationData?.forecast?.forecastday[0]?.day.uv;
          const dailyuv1 = currentLocationData?.forecast?.forecastday[1]?.day.uv;
          const dailyuv2 = currentLocationData?.forecast?.forecastday[2]?.day.uv;
          const dailyuv3 = currentLocationData?.forecast?.forecastday[3]?.day.uv;
          const dailyuv4 = currentLocationData?.forecast?.forecastday[4]?.day.uv;
          const dailyuv5 = currentLocationData?.forecast?.forecastday[5]?.day.uv;
          const dailyuv6 = currentLocationData?.forecast?.forecastday[6]?.day.uv;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>UV Index Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        data12am,
                        data3am,
                        data6am,
                        data9am,
                        data12pm,
                        data3pm,
                        data6pm,
                        data9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>UV Index Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailyuv0,
                        dailyuv1,
                        dailyuv2,
                        dailyuv3,
                        dailyuv4,
                        dailyuv5,
                        dailyuv6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              </ScrollView>
              <Text style={styles.time}></Text>
            </View>
          );
        } else if (currentView.toLowerCase() === "pressure") {
          const data12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].pressure_mb;
          const data3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].pressure_mb;
          const data6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].pressure_mb;
          const data9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].pressure_mb;
          const data12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].pressure_mb;
          const data3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].pressure_mb;
          const data6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].pressure_mb;
          const data9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].pressure_mb;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Pressure Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        data12am,
                        data3am,
                        data6am,
                        data9am,
                        data12pm,
                        data3pm,
                        data6pm,
                        data9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="mb"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              </ScrollView>
              <Text style={styles.time}></Text>
            </View>
          );
        } else if (currentView.toLowerCase() === "cloud") {
          const data12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].cloud;
          const data3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].cloud;
          const data6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].cloud;
          const data9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].cloud;
          const data12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].cloud;
          const data3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].cloud;
          const data6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].cloud;
          const data9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].cloud;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Cloud % Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        data12am,
                        data3am,
                        data6am,
                        data9am,
                        data12pm,
                        data3pm,
                        data6pm,
                        data9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="%"
                yAxisInterval={1}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              </ScrollView>
              <Text style={styles.time}></Text>
            </View>
          );
        } else if ((currentView.toLowerCase() === "wind speed") || (currentView.toLowerCase() === "wind direction") || (currentView.toLowerCase() === "gust speed")){
          const wspeed12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].wind_kph;
          const wspeed3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].wind_kph;
          const wspeed6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].wind_kph;
          const wspeed9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].wind_kph;
          const wspeed12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].wind_kph;
          const wspeed3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].wind_kph;
          const wspeed6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].wind_kph;
          const wspeed9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].wind_kph;

          const gspeed12am = currentLocationData?.forecast?.forecastday[0]?.hour[0].gust_kph;
          const gspeed3am = currentLocationData?.forecast?.forecastday[0]?.hour[2].gust_kph;
          const gspeed6am = currentLocationData?.forecast?.forecastday[0]?.hour[5].gust_kph;
          const gspeed9am = currentLocationData?.forecast?.forecastday[0]?.hour[8].gust_kph;
          const gspeed12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11].gust_kph;
          const gspeed3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14].gust_kph;
          const gspeed6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17].gust_kph;
          const gspeed9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20].gust_kph;

          const dailywind0 = currentLocationData?.forecast?.forecastday[0]?.day.maxwind_kph;
          const dailywind1 = currentLocationData?.forecast?.forecastday[1]?.day.maxwind_kph;
          const dailywind2 = currentLocationData?.forecast?.forecastday[2]?.day.maxwind_kph;
          const dailywind3 = currentLocationData?.forecast?.forecastday[3]?.day.maxwind_kph;
          const dailywind4 = currentLocationData?.forecast?.forecastday[4]?.day.maxwind_kph;
          const dailywind5 = currentLocationData?.forecast?.forecastday[5]?.day.maxwind_kph;
          const dailywind6 = currentLocationData?.forecast?.forecastday[6]?.day.maxwind_kph;
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>Wind Speed(Kmph) Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        wspeed12am,
                        wspeed3am,
                        wspeed6am,
                        wspeed9am,
                        wspeed12pm,
                        wspeed3pm,
                        wspeed6pm,
                        wspeed9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="Kph"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>Daily Wind Speed Chart For Next {forecastdays} Days:</Text>
              <LineChart
                data={{
                  labels: [getDayFromDate(currentLocationData?.forecast?.forecastday[0]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[1]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[2]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[3]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[4]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[5]?.date).slice(0, 3), getDayFromDate(currentLocationData?.forecast?.forecastday[6]?.date).slice(0, 3)],
                  datasets: [
                    {
                      data: [
                        dailywind0,
                        dailywind1,
                        dailywind2,
                        dailywind3,
                        dailywind4,
                        dailywind5,
                        dailywind6
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="kph"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
              <Text style={styles.time}>Gust Speed(Kmph) Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        gspeed12am,
                        gspeed3am,
                        gspeed6am,
                        gspeed9am,
                        gspeed12pm,
                        gspeed3pm,
                        gspeed6pm,
                        gspeed9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix="Kph"
                yAxisInterval={50}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              
              </ScrollView>
              <Text style={styles.time}></Text>
            </View>
          );
        } else if ((currentView.toLowerCase() === "co level") || (currentView.toLowerCase() === "no2 level") || (currentView.toLowerCase() === "o3 level") || (currentView.toLowerCase() === "so2 level") || (currentView.toLowerCase() === "pm2.5 level") || (currentView.toLowerCase() === "pm10 level") || (currentView.toLowerCase() === "usepa index") || (currentView.toLowerCase() === "gbdefra index")) {
          const co12am = currentLocationData?.forecast?.forecastday[0]?.hour[0]?.air_quality.co;
          const co3am = currentLocationData?.forecast?.forecastday[0]?.hour[2]?.air_quality.co;
          const co6am = currentLocationData?.forecast?.forecastday[0]?.hour[5]?.air_quality.co;
          const co9am = currentLocationData?.forecast?.forecastday[0]?.hour[8]?.air_quality.co;
          const co12pm = currentLocationData?.forecast?.forecastday[0]?.hour[11]?.air_quality.co;
          const co3pm = currentLocationData?.forecast?.forecastday[0]?.hour[14]?.air_quality.co;
          const co6pm = currentLocationData?.forecast?.forecastday[0]?.hour[17]?.air_quality.co;
          const co9pm = currentLocationData?.forecast?.forecastday[0]?.hour[20]?.air_quality.co;

          const no212am = currentLocationData?.forecast?.forecastday[0]?.hour[0]?.air_quality.no2;
          const no23am = currentLocationData?.forecast?.forecastday[0]?.hour[2]?.air_quality.no2;
          const no26am = currentLocationData?.forecast?.forecastday[0]?.hour[5]?.air_quality.no2;
          const no29am = currentLocationData?.forecast?.forecastday[0]?.hour[8]?.air_quality.no2;
          const no212pm = currentLocationData?.forecast?.forecastday[0]?.hour[11]?.air_quality.no2;
          const no23pm = currentLocationData?.forecast?.forecastday[0]?.hour[14]?.air_quality.no2;
          const no26pm = currentLocationData?.forecast?.forecastday[0]?.hour[17]?.air_quality.no2;
          const no29pm = currentLocationData?.forecast?.forecastday[0]?.hour[20]?.air_quality.no2;

          const o312am = currentLocationData?.forecast?.forecastday[0]?.hour[0]?.air_quality.o3;
          const o33am = currentLocationData?.forecast?.forecastday[0]?.hour[2]?.air_quality.o3;
          const o36am = currentLocationData?.forecast?.forecastday[0]?.hour[5]?.air_quality.o3;
          const o39am = currentLocationData?.forecast?.forecastday[0]?.hour[8]?.air_quality.o3;
          const o312pm = currentLocationData?.forecast?.forecastday[0]?.hour[11]?.air_quality.o3;
          const o33pm = currentLocationData?.forecast?.forecastday[0]?.hour[14]?.air_quality.o3;
          const o36pm = currentLocationData?.forecast?.forecastday[0]?.hour[17]?.air_quality.o3;
          const o39pm = currentLocationData?.forecast?.forecastday[0]?.hour[20]?.air_quality.o3;

          const so212am = currentLocationData?.forecast?.forecastday[0]?.hour[0]?.air_quality.so2;
          const so23am = currentLocationData?.forecast?.forecastday[0]?.hour[2]?.air_quality.so2;
          const so26am = currentLocationData?.forecast?.forecastday[0]?.hour[5]?.air_quality.so2;
          const so29am = currentLocationData?.forecast?.forecastday[0]?.hour[8]?.air_quality.so2;
          const so212pm = currentLocationData?.forecast?.forecastday[0]?.hour[11]?.air_quality.so2;
          const so23pm = currentLocationData?.forecast?.forecastday[0]?.hour[14]?.air_quality.so2;
          const so26pm = currentLocationData?.forecast?.forecastday[0]?.hour[17]?.air_quality.so2;
          const so29pm = currentLocationData?.forecast?.forecastday[0]?.hour[20]?.air_quality.so2;

          const pm2_512am = currentLocationData?.forecast?.forecastday[0]?.hour[0]?.air_quality.pm2_5;
          const pm2_53am = currentLocationData?.forecast?.forecastday[0]?.hour[2]?.air_quality.pm2_5;
          const pm2_56am = currentLocationData?.forecast?.forecastday[0]?.hour[5]?.air_quality.pm2_5;
          const pm2_59am = currentLocationData?.forecast?.forecastday[0]?.hour[8]?.air_quality.pm2_5;
          const pm2_512pm = currentLocationData?.forecast?.forecastday[0]?.hour[11]?.air_quality.pm2_5;
          const pm2_53pm = currentLocationData?.forecast?.forecastday[0]?.hour[14]?.air_quality.pm2_5;
          const pm2_56pm = currentLocationData?.forecast?.forecastday[0]?.hour[17]?.air_quality.pm2_5;
          const pm2_59pm = currentLocationData?.forecast?.forecastday[0]?.hour[20]?.air_quality.pm2_5;

          const pm10_512am = currentLocationData?.forecast?.forecastday[0]?.hour[0]?.air_quality.pm10;
          const pm10_53am = currentLocationData?.forecast?.forecastday[0]?.hour[2]?.air_quality.pm10;
          const pm10_56am = currentLocationData?.forecast?.forecastday[0]?.hour[5]?.air_quality.pm10;
          const pm10_59am = currentLocationData?.forecast?.forecastday[0]?.hour[8]?.air_quality.pm10;
          const pm10_512pm = currentLocationData?.forecast?.forecastday[0]?.hour[11]?.air_quality.pm10;
          const pm10_53pm = currentLocationData?.forecast?.forecastday[0]?.hour[14]?.air_quality.pm10;
          const pm10_56pm = currentLocationData?.forecast?.forecastday[0]?.hour[17]?.air_quality.pm10;
          const pm10_59pm = currentLocationData?.forecast?.forecastday[0]?.hour[20]?.air_quality.pm10;

          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ScrollView contentContainerStyle={styles.scrollViewContainer}>
              <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(1)}/>
              <Text style={styles.city}>{currentView}</Text>
              <Text style={styles.time}>CO Index Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        co12am,
                        co3am,
                        co6am,
                        co9am,
                        co12pm,
                        co3pm,
                        co6pm,
                        co9pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>NO2 Index Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        no212am,
                        no23am,
                        no26am,
                        no29am,
                        no212pm,
                        no23pm,
                        no26pm,
                        no29pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>O3 Index Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        o312am,
                        o33am,
                        o36am,
                        o39am,
                        o312pm,
                        o33pm,
                        o36pm,
                        o39pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>SO2 Index Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        so212am,
                        so23am,
                        so26am,
                        so29am,
                        so212pm,
                        so23pm,
                        so26pm,
                        so29pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>PM 2.5 Index Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        pm2_512am,
                        pm2_53am,
                        pm2_56am,
                        pm2_59am,
                        pm2_512pm,
                        pm2_53pm,
                        pm2_56pm,
                        pm2_59pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>PM 10 Index Chart:</Text>
              <LineChart
                data={{
                  labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                  datasets: [
                    {
                      data: [
                        pm10_512am,
                        pm10_53am,
                        pm10_56am,
                        pm10_59am,
                        pm10_512pm,
                        pm10_53pm,
                        pm10_56pm,
                        pm10_59pm
                      ]
                    }
                  ]
                }}
                width={Dimensions.get("window").width * 0.95}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                yAxisInterval={10}
                chartConfig={{
                  backgroundColor: "#ffffff",
                  backgroundGradientFrom: "#007fff",
                  backgroundGradientTo: "#0066cc",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  style: {
                    borderRadius: 16
                  },
                  propsForDots: {
                    r: "6",
                    strokeWidth: "2",
                    stroke: "#ffa726"
                  }
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
              <Text style={styles.time}>Air quality refers to the cleanliness and purity of the air we breathe, influenced by factors such as pollution from vehicles, industrial activities, wildfires, and natural sources, along with weather conditions like temperature and wind patterns; improving air quality involves reducing emissions through measures like transitioning to clean energy, enhancing public transportation, implementing stricter regulations on industrial emissions, promoting renewable energy sources, encouraging green spaces, and raising awareness about the importance of sustainable practices for the environment and human health.</Text>
            </ScrollView>
            </View>
          );
        } else if (currentView.toLowerCase().startsWith("coords:")) {
          const [, lat, long] = currentView.split(/:\s|,\s/);
          const latitude = parseFloat(lat);
          const longitude = parseFloat(long);
          getWeatherData(latitude, longitude, false);
          const forecastday1 = searchedLocationData?.forecast?.forecastday[0]?.day;
          const forecastday2 = searchedLocationData?.forecast?.forecastday[1]?.day;
          const forecastday3 = searchedLocationData?.forecast?.forecastday[2]?.day;
          const forecastday4 = searchedLocationData?.forecast?.forecastday[3]?.day;
          const forecastday5 = searchedLocationData?.forecast?.forecastday[4]?.day;
          const forecastday6 = searchedLocationData?.forecast?.forecastday[5]?.day;
          const forecastday7 = searchedLocationData?.forecast?.forecastday[6]?.day;
          const hourlyData = Array.from({ length: 24 }, (_, index) => {
            const hour = searchedLocationData?.forecast?.forecastday[0]?.hour[index];
            if (hour) {
              return {
                time: `${index % 12 || 12} ${index < 12 ? 'AM' : 'PM'}`,
                icon: `http:${hour.condition.icon}`,
                temperature: `${hour.temp_c}°C`
              };
            } else {
              return null;
            }
          }).filter(Boolean);
          return (
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
            <Button style={{alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 4, elevation: 3, backgroundColor: 'black'}} title="Go back" onPress={() => handleButtonPress(2)}/>
            <ImageBackground source={getBackgroundImage()} style={styles.backgroundImage}>
              <View style={styles.container}>
  
                {searchedLocationData && (
                  <View>
                    <Text style={styles.city}>{searchedLocationData.location.name}, {searchedLocationData.location.region}</Text>
                    <Text style={styles.city}>{searchedLocationData.location.country}</Text>
                    <Text style={styles.temperature}>{searchedLocationData.current.temp_c} °C | {searchedLocationData.current.temp_f} °F</Text>
                    <Text style={styles.weather}>{capitalizeFirstLetter(searchedLocationData.current.condition.text)}</Text>
                    <Text style={styles.weather}>Current Time: {searchedLocationData.location.localtime}</Text>
                    <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                    <Text style={{ marginTop: 5, marginBottom: 10, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Hourly Weather:</Text>
                    <FlatList
                      data={hourlyData}
                      renderItem={renderItem}
                      keyExtractor={(item, index) => index.toString()}
                      horizontal
                      contentContainerStyle={styles.scrollViewContent}
                    />
                    <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                    <Text style={{ marginTop: 5, marginBottom: 10, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>{forecastdays} Day Forecast:</Text>
                    {renderforecastbox('Today', 'http:' + forecastday1.condition.icon, 'H: ' + forecastday1.maxtemp_c + ', L: ' + forecastday1.mintemp_c)}
                    {renderforecastbox(getDayFromDate(searchedLocationData?.forecast?.forecastday[1]?.date), 'http:' + forecastday2.condition.icon, 'H: ' + forecastday2.maxtemp_c + ', L: ' + forecastday2.mintemp_c)}
                    {renderforecastbox(getDayFromDate(searchedLocationData?.forecast?.forecastday[2]?.date), 'http:' + forecastday3.condition.icon, 'H: ' + forecastday3.maxtemp_c + ', L: ' + forecastday3.mintemp_c)}
                    {renderforecastbox(getDayFromDate(searchedLocationData?.forecast?.forecastday[3]?.date), 'http:' + forecastday4.condition.icon, 'H: ' + forecastday4.maxtemp_c + ', L: ' + forecastday4.mintemp_c)}
                    {renderforecastbox(getDayFromDate(searchedLocationData?.forecast?.forecastday[4]?.date), 'http:' + forecastday5.condition.icon, 'H: ' + forecastday5.maxtemp_c + ', L: ' + forecastday5.mintemp_c)}
                    {renderforecastbox(getDayFromDate(searchedLocationData?.forecast?.forecastday[5]?.date), 'http:' + forecastday6.condition.icon, 'H: ' + forecastday6.maxtemp_c + ', L: ' + forecastday6.mintemp_c)}
                    {renderforecastbox(getDayFromDate(searchedLocationData?.forecast?.forecastday[6]?.date), 'http:' + forecastday7.condition.icon, 'H: ' + forecastday7.maxtemp_c + ', L: ' + forecastday7.mintemp_c)}
                    <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                    <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Statistics:</Text>
                    <View style={styles.weatherInfoContainer}>
                      {renderWeatherInfoBox('Precipitation', `${searchedLocationData.current.precip_in} inches`)}
                      {renderWeatherInfoBox('Feels Like', `${searchedLocationData.current.feelslike_c}°C | ${searchedLocationData.current.feelslike_f}°F`)}
                      {renderWeatherInfoBox('Visibility', `${searchedLocationData.current.vis_km} Km`)}
                      {renderWeatherInfoBox('Chance Of Rain', `${forecastday1.daily_chance_of_rain}%`)}
                      {renderWeatherInfoBox('Chance Of Snow', `${forecastday1.daily_chance_of_snow}%`)}
                      {renderWeatherInfoBox('Humidity', `${searchedLocationData.current.humidity} g/m3`)}
                      {renderWeatherInfoBox('UV Index', searchedLocationData.current.uv)}
                      {renderWeatherInfoBox('Pressure', `${searchedLocationData.current.pressure_mb} mb`)}
                      {renderWeatherInfoBox('Cloud', `${searchedLocationData.current.cloud}%`)}
                    </View>
                    <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                    <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Wind Data:</Text>
                    <View style={styles.weatherInfoContainer}>
                      {renderWeatherInfoBox('Wind Speed', `${searchedLocationData.current.wind_kph} Km/h`)}
                      {renderWeatherInfoBox('Wind Direction', formatdirection(searchedLocationData.current.wind_dir))}
                      {renderWeatherInfoBox('Gust Speed', `${searchedLocationData.current.gust_kph} Km/h`)}
                    </View>
                    <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                    <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Air Quality:</Text>
                    <View style={styles.weatherInfoContainer}>
                      {renderWeatherInfoBox('CO Level', `${searchedLocationData.current.air_quality.co}`)}
                      {renderWeatherInfoBox('NO2 Level', `${searchedLocationData.current.air_quality.no2}`)}
                      {renderWeatherInfoBox('O3 Level', `${searchedLocationData.current.air_quality.o3}`)}
                      {renderWeatherInfoBox('SO2 Level', `${searchedLocationData.current.air_quality.so2}`)}
                      {renderWeatherInfoBox('PM2.5 Level', `${searchedLocationData.current.air_quality.pm2_5}`)}
                      {renderWeatherInfoBox('PM10 Level', `${searchedLocationData.current.air_quality.pm10}`)}
                      {renderWeatherInfoBox('USEPA Index', 17.0)}
                      {renderWeatherInfoBox('GBDEFRA Index', 12.21)}
                    </View>
                    <View style={{ borderBottomColor: 'darkgrey', borderBottomWidth: 2, height: 20, marginVertical: 10}}/>
                    <Text style={{ marginTop: 5, marginBottom: 1, fontSize: 18, textTransform: 'capitalize', color: 'white' }}>Astronomy:</Text>
                    <View style={styles.weatherInfoContainer}>
                      {renderWeatherInfoBox('Sunrise', `${astro.sunrise}`)}
                      {renderWeatherInfoBox('Sunset', `${astro.sunset}`)}
                      {renderWeatherInfoBox('Moonrise', `${astro.moonrise}`)}
                      {renderWeatherInfoBox('Moon Phase', `${astro.moon_phase}`)}
                    </View>
                  </View>
                )}
              </View>
            </ImageBackground>
          </ScrollView>
          );
        } else {
          return (
            <View style={{ backgroundColor: 'lightblue', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text>I Can't Figure Out How You Landed Here?</Text>
            </View>
          );
        }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: '9%', backgroundColor: 'azure', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>BetterWeather</Text>
      </View>

      {/* Middle view */}
      <View style={{ flex: 8 }}>
        {renderMiddleView()}
      </View>

      {/* Bottom border with buttons */}
      <View style={{ height: '6%', backgroundColor: 'azure', flexDirection: 'row', alignItems: 'center' }}>
      <CustomButton title="🏠" onPress={() => handleButtonPress(1)} isSelected={currentView === 1} />
        <CustomButton title="📍" onPress={() => handleButtonPress(2)} isSelected={currentView === 2} />
        <CustomButton title="📸" onPress={() => handleButtonPress(3)} isSelected={currentView === 3} />
        <CustomButton title="ℹ️" onPress={() => handleButtonPress(4)} isSelected={currentView === 4} />
      </View>
    </View>
  );
};

export default App;
