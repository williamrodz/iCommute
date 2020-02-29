/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import 'react-native-gesture-handler';

import * as React from 'react';
import { View, Text, Button,StyleSheet,Alert,Picker,TextInput } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
navigator.geolocation = require('@react-native-community/geolocation');
import { firebase } from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
const apiKeys = require('./apiKeys.json');


const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};
const workPlace = { description: 'Work', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }};


var globalFromAddress= null;
var globalToAddress= null;



class GooglePlacesInput extends React.Component{


  render (){
    return (
      <GooglePlacesAutocomplete
        placeholder='Search'
        minLength={4} // minimum length of text to search
        autoFocus={true}
        returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
        keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
        listViewDisplayed='auto'    // true/false/undefined
        fetchDetails={true}
        renderDescription={row => row.description} // custom description render
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
          console.log("- - - - - - - - - ");
          console.log("data",data);
          console.log("\n");
          console.log("details", details);
          this.props.processAddressFunction(details['formatted_address']);

        }}

        getDefaultValue={() => ''}
        query={{
          // available options: https://developers.google.com/places/web-service/autocomplete
          key: apiKeys.googleplaces,
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


}

function getPickerItem(label,item,key){
  return <Picker.Item label={item} value={item} key={key}/>
}


async function onSignIn() {
  // Get the users ID
  const uid = auth().currentUser.uid;

  // Create a reference
  const ref = database().ref(`/users/test_user`); // database().ref(`/users/${uid}`);

  // Fetch the data snapshot
  const snapshot = await ref.once('value');

  return snapshot.val();
}

async function onCreateAccount() {
  // Get the users ID
  const uid = 'test_user'//auth().currentUser.uid;

  // Create a reference
  const ref = database().ref(`/users/test_user`);

  await ref.set({
    uid,
    name: 'guineo',
    role: 'admin',
  });
}

function setFromAddress(address){
  globalFromAddress = address;
  console.log(`Set from address to ${address}`);

}

function setToAddress(address){
  globalToAddress = address;
  console.log(`Set to address to ${address}`);


}

async function submitNewCommuteButton (){

  const current_value = onSignIn()


  console.log("submitNewCommuteButton")
  Alert.alert(`Submitted new commute","From:${current_value}\nTo:`)
  onCreateAccount().then( (data)=> {
    console.log("Succesful:"+data)
    }).catch((error)=>{
      console.log("Error"+error)
      });
}

class MainView extends React.Component{
  constructor(props) {
    super(props)
    this.handler = this.handler.bind(this)
  }

  handler() {
    this.setState({
      someVar: 'some value'
    })
  }

  render() {
    return <Child handler = {this.handler} />
  }
}

class Child extends React.Component {
  render() {
    return <Button onClick = {this.props.handler}/ >
  }
}

function HomeScreen({navigation}) {
  const daysOfTheWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
  var pickerItems = []
  daysOfTheWeek.forEach((item, i) => {
    pickerItems.push(getPickerItem(item,item,i))

  });



  return (
    <View style={{flex:1,backgroundColor:'bisque',alignItems:'center',justifyContent:'center',paddingTop:100}}>
      <Text style={{fontSize:20,paddingBottom:10}}>What's your home address?</Text>
      <GooglePlacesInput processAddressFunction = {setFromAddress}/>
      <Text style={{fontSize:20}}>Where's work?</Text>
      <GooglePlacesInput processAddressFunction = {setToAddress}/>
      <Button style={{backgroundColor:'white',paddingBottom:20}} title="Submit" onPress={submitNewCommuteButton}/>







    </View>
  );
}
// <View style={{flex:2,backgroundColor:'orange',alignItems: 'center',justifyContent: 'center',paddingTop:50,width:500}}>
//   <Text styles={{fontSize:1}}>What's your daily commute?</Text>
//   <Text style={{paddingTop:0}}>What's your daily commute?</Text>
// </View>
// <View style={{flex:2,alignItems: 'stretch',justifyContent: 'center',backgroundColor:'chartreuse',width:500}}>
//   <Button style={{backgroundColor:'white'}} title="Submit" onPress={submitNewCommuteButton}/>
//   <View style={{alignItems:'center'}}>
//     <Text style={styles.modulesHeader}>The following Firebase modules are pre-installed:</Text>
//     {firebase.database.nativeModuleExists && <Text style={styles.module}>database()</Text>}
//   </View>
// </View>

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
