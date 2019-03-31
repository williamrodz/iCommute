//
//  MainViewController.swift
//  iCommute
//
//  Created by William A. Rodriguez on 3/31/19.
//  Copyright © 2019 GoldenRod. All rights reserved.
//

import UIKit

class MainViewController: UIViewController {
    
    // variables
    @IBOutlet weak var originField: UITextField!
    @IBOutlet weak var destinationField: UITextField!
    
    
    let GoogleMapsAPIKey = "AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE";
    let GoogleMapsHTTPRequestBase = "https://maps.googleapis.com/maps/api/distancematrix/json?origins";

    
    // https://maps.googleapis.com/maps/api/distancematrix/json?origins=Boston,MA|Charlestown,MA&destinations=Lexington,MA|Concord,MA&departure_time=now&key=AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    
    func executeHTTPRequest(urlString:String){
        // here we are initializing the URL Struct with the path which we want to access from the API
        let url = URL(string: urlString)!
        //next, let's instantiate a shared URLSession which will provide us with an API to interact with 3rd parties (fetch/post data)
        let urlSession = URLSession.shared
        //create the URLRequest which will be used for fetching the data
        let getRequest = URLRequest(url: url)
        
        //Lets update the completion handler so that it prints some data for us and to check if this works.
        let task = urlSession.dataTask(with: getRequest as URLRequest, completionHandler: { data, response, error in
            
            guard error == nil else {
                return
            }
            
            guard let data = data else {
                return
            }
            
            do {
                
                // the data is returned in JSON format and needs to be converted into something that swift can work with
                // we are converting it into a dictionary of type [String: Any]
                if let json = try JSONSerialization.jsonObject(with: data, options: .mutableContainers) as? [String: [String:String]] {
                    let rows = json["rows"]!
                    let elements = rows["elements"]!
                    let firstElement = elements[0]
                    let duration = firstElement["duration"]!
                    print(duration)

                }
            } catch let error {
                print(error.localizedDescription)
            }
        })
        
        task.resume()

    }
    
    func getDistanceJSON(origin:String,destination:String){
        let GoogleMapsHTTPRequestTail = "&departure_time=now&key="+GoogleMapsAPIKey;
        let requestURL = GoogleMapsHTTPRequestBase+origin+"&destinations="+destination+GoogleMapsHTTPRequestTail;
        
        executeHTTPRequest(urlString: requestURL);
    }
    
    
    @IBAction func calculateCommuteTimeButton(_ sender: UIButton) {  2
        getDistanceJSON(origin: originField.text ?? "428 Memorial Dr, Cambridge, MA",destination: destinationField.text ?? "77 Massachusetts Ave, Cambridge, MA");
    }
    
    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepare(for segue: UIStoryboardSegue, sender: Any?) {
        // Get the new view controller using segue.destination.
        // Pass the selected object to the new view controller.
    }
    */

}
