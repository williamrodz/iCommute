import React from 'react';
import { View, Text,StyleSheet,Alert,Button} from 'react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Icon from 'react-native-vector-icons/FontAwesome';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
const apiKeys = require('./apiKeys.json');

const homePlace = { description: 'Home', geometry: { location: { lat: 48.8152937, lng: 2.4597668 } }};
const workPlace = { description: 'Work', geometry: { location: { lat: 48.8496818, lng: 2.2940881 } }};


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


export default class AddCommute extends React.Component {
  constructor(props){
    super(props);
    this.state={timePickerVisible:false}

  }

  render (){
    return (
      <View style={{flex:1,backgroundColor:'bisque',alignItems:'center',justifyContent:'center',paddingTop:100}}>
        <Text style={{fontSize:20,paddingBottom:10}}>What's your home address?</Text>
        <GooglePlacesInput processAddressFunction = {from=>this.setState({from:from})}/>
        <Text style={{fontSize:20}}>Where's work?</Text>
        <GooglePlacesInput processAddressFunction = {to=>this.setState({to:to})}/>
        <DateTimePickerModal
          isVisible={this.state.timePickerVisible}
          mode="time"
          onConfirm={(time)=>this.setState({timePickerVisible:false,time:time})}
          onCancel={()=>Alert.alert("canceled")}
        />
        <Button icon={<Icon name="clock-o" size={15} color="white"/>}
        style={{padding:5}} title="Set Time" onPress={()=>this.setState({timePickerVisible:true})}/>

        <Button buttonStyle={{backgroundColor:'green'}}containerStyle={{paddingBottom:40}} titleStyle={{color:"white"}}
        type="clear" title="Submit"
        disabled={!(this.state.from && this.state.to && this.state.time)}
        onPress={()=> submitNewCommuteButton(this.props.navigation,this.props.route,this.state)}/>
        <Button icon={<Icon name="clock-o" size={15} color="white"/>}
        style={{padding:5}} title="Test" onPress={()=>testSubmit(this.props.navigation,this.props.route,this.state)}/>


      </View>
    );
  }

}
