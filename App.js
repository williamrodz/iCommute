/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';

import * as React from 'react';
import { View, Text, Button,StyleSheet,Alert,Picker } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
navigator.geolocation = require('@react-native-community/geolocation');

import { firebase } from '@react-native-firebase/database';

import database from '@react-native-firebase/database';



const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};
const workPlace = { description: 'Work', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }};

const GooglePlacesInput = () => {
  return (
    <GooglePlacesAutocomplete
      placeholder='Search'
      minLength={4} // minimum length of text to search
      autoFocus={false}
      returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
      keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
      listViewDisplayed='auto'    // true/false/undefined
      fetchDetails={true}
      renderDescription={row => row.description} // custom description render
      onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
        console.log("HELLO THERE");
        console.log("data",data);
        console.log("\n");
        console.log("details", details);

      }}

      getDefaultValue={() => ''}

      query={{
        // available options: https://developers.google.com/places/web-service/autocomplete
        key: 'AIzaSyB508_X4Q-wFnZhvrcaIW5NtfM2Gsxqs30',
        language: 'en', // language of the results
      }}

      styles={{
        textInputContainer: {
          width: '100%',
        },
        description: {
          fontWeight: 'bold'
        },
        predefinedPlacesDescription: {
          color: '#1faadb'
        }
      }}

      currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
      currentLocationLabel="Current location"
      nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
      GoogleReverseGeocodingQuery={{
        // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
      }}
      GooglePlacesSearchQuery={{
        // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
        rankby: 'distance',
        type: 'cafe'
      }}

      GooglePlacesDetailsQuery={{
        // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
        fields: 'formatted_address',
      }}

      filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities
      predefinedPlaces={[homePlace, workPlace]}

      debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
    />
  );
}

function getPickerItem(label,item,key){
  return <Picker.Item label={item} value={item} key={key}/>
}

function submitNewCommuteButton (){


  console.log("submitNewCommuteButton")
  Alert.alert("Submitted new commute","From:\nTo:")
}


function HomeScreen({navigation}) {
  const daysOfTheWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  var pickerItems = []
  daysOfTheWeek.forEach((item, i) => {
    pickerItems.push(getPickerItem(item,item,i))

  });



  return (
    <View style={styles.container}>
      <View style={{flex:2,backgroundColor:'orange',alignItems: 'center',justifyContent: 'center',paddingTop:50}}>
        <Text styles={{fontSize:30}}>What's your daily commute?</Text>
        <GooglePlacesInput/>
      </View>
      <View style={{flex:2,backgroundColor:'aqua',alignItems: 'center',justifyContent: 'center',}}>
        <Text style={{paddingTop:0}}>What's your daily commute?</Text>
        <GooglePlacesInput/>
      </View>
      <View style={{flex:2,alignItems: 'stretch',justifyContent: 'center',backgroundColor:'chartreuse',width:500}}>
        <Button style={{backgroundColor:'white'}} title="Submit" onPress={submitNewCommuteButton}/>
        <View style={{alignItems:'center'}}>
          <Text style={styles.modulesHeader}>The following Firebase modules are pre-installed:</Text>
          {firebase.database.nativeModuleExists && <Text style={styles.module}>database()</Text>}
        </View>


      </View>
    </View>
  );
}


function AddressRevealButton(){
  return (
    <Button title="reveal" onPress={()=>this.state.myText = ":)"}>
    </Button>

    );
}

function DetailsScreen({navigation}) {
  return (
    <View style={{flex:1,alignItems:'stretch',width:400}}>
      <View style={{flex:1,backgroundColor:'green'}}>
        <Text style={{fontSize:30}}>Details Screen</Text>
      </View>
      <View style={{flex:1,backgroundColor:'chartreuse',alignItems:'center'}}>
        <Text style={{fontSize:30}}>Details Screen</Text>
        <Button title="hi"/>


      </View>

    </View>
  );
}


var styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    },
  topPadded:{
    paddingTop:50,
  },
  homeAddressInputView:{
    backgroundColor:'orange'
  },
  workAddressInputView:{
    backgroundColor:'aqua'
    },
  boldText:{
  }

  });


const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Details" component={DetailsScreen} />
    </Tab.Navigator>

  );
}

function App() {
    this.state = {
      myText: 'hello'
    }
  return (
    <NavigationContainer>
      <MyTabs/>
    </NavigationContainer>
  );
}

export default App;
