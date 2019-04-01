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
    var savedNotifications:[CommuteNotification] = [];
    let testOrigin:String = "428 Memorial Dr, Cambridge, MA"
    let testDestination:String = "77 Massachusetts Ave, Cambridge, MA"
    
    let GoogleMapsAPIKey = "AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE";
    let GoogleMapsHTTPRequestBase = "https://maps.googleapis.com/maps/api/distancematrix/json?origins";

    
    // https://maps.googleapis.com/maps/api/distancematrix/json?origins=Boston,MA|Charlestown,MA&destinations=Lexington,MA|Concord,MA&departure_time=now&key=AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    
    func getRequestURL(origin:String,destination:String) -> URL?{
        var urlComponents = URLComponents(string: "https://maps.googleapis.com/maps/api/distancematrix/json?")
        
        let arguments: [String: String] = [
            "origins": testOrigin,
            "destinations": testDestination,
            "departure_time": "now",
            "key":"AIzaSyB65D4XHv6PkqvWJ7C-cFvT1QHi9OkqGCE"
        ]
        
        var queryItems = [URLQueryItem]()
        
        for (key, value) in arguments {
            queryItems.append(URLQueryItem(name: key, value: value))
        }
        
        urlComponents?.queryItems = queryItems
        
        if let url = urlComponents?.url {
            print(url) //
            return url
        } else{
            return URL(string:"https://www.google.com")
        }
    }
    
    
    func fetchData(completion: @escaping ([String:Any]?, Error?) -> Void) {
        //let url = URL(string: "http://api.geekdo.com/api/images?ajax=1&gallery=all&nosession=1&objectid=127023&objecttype=thing&pageid=357&showcount=1&size=thumb&sort=recent")!
        let url = getRequestURL(origin: "test", destination: "test")!;
        
        let task = URLSession.shared.dataTask(with: url) { (data, response, error) in
            guard let data = data else { return }
            do {
                if let array = try JSONSerialization.jsonObject(with: data, options: .allowFragments) as? [String:Any]{
                    completion(array, nil)
                }
            } catch {
                print(error)
                completion(nil, error)
            }
        }
        task.resume()
    }
    

    
    
    
    

    
    
    @IBAction func calculateCommuteTimeButton(_ sender: UIButton) {
        print("hi")
        fetchData { (dict, error) in
            //debugPrint(dict)
            if let rows = dict?["rows"] as? [[String:Any]]{
                if let elements = rows[0] as? [String:Any]{
                    print("elements is")
                    print(elements)
                    if let actualElements = elements["elements"] as? [String:Any]{
                        print(actualElements)
                    }
                
                }
            }
        }
    }
    
    func saveNewNotification(){
        var newNotification = CommuteNotification(origin: originField.text ?? testOrigin,destination: destinationField.text ?? testDestination,departureTime: "3:00PM");
        savedNotifications.append(newNotification);
    }
    
    func sendNotification(){
        let notificatioName = Notification.Name("hi");
        let newNotification = Notification(name:notificatioName);
        
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
