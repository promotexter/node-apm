app.controller("ctrl", function($scope, $stomp) {
    
    $scope.metrics = {};

    $scope.message = "TEST";


    $scope.cookData = function(data)
	{
		/*
			{
				source : 'localhost',
				type : 'app',
				body : {
					metric1 : {
						currentRate:
						count: 
					}
				}
			}
		*/
		// console.log(data);

		
			// is the source there?
			if(!$scope.metrics[data.source])
				$scope.metrics[data.source] = {};

			// is the type there
			if(!$scope.metrics[data.source][data.type])
				$scope.metrics[data.source][data.type] = {};

			if(!$scope.metrics[data.source][data.type].metrics)
				$scope.metrics[data.source][data.type].metrics = {};		

			angular.forEach(data.body, function(v,k){
				// $scope.$apply(function(){		
					$scope.metrics[data.source][data.type].metrics[k] = v.count;			
				
				// });		
			})

			$scope.$apply();
		


	}

    $stomp.setDebug(function (args) {
	    document.getElementById('log').value += args + '\n';
	});

	$stomp
	    .connect('http://127.0.0.1:15674/stomp', { login: 'guest', passcode: 'guest'})
	 
	    // frame = CONNECTED headers 
	    .then(function (frame) {
	 
	        var subscription = $stomp.subscribe('/exchange/node-apm', function (payload, headers, res) {
	            $scope.payload = payload;


	            // $scope.$apply(function() {
	            	$scope.cookData(payload);
	            // });
	            // console.log(payload);
	            // document.getElementById('messages').value += payload + '\n';
	        }, {
	            "headers": "are awesome"
	        });
	 
	        // Unsubscribe 
	        // subscription.unsubscribe();
	 
	        // Send message 
	        // $stomp.send('/dest', {
	        //     message: 'body'
	        // }, {
	        //     priority: 9,
	        //     custom: 42 //Custom Headers 
	        // });
	 
	        // Disconnect 
	        // $stomp.disconnect(function () {
	 
	        // });
	    });


	
});