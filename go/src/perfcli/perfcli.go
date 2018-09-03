package main
import (
	"fmt"
	"flag"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"time"
	"math/rand"
)
var tr *http.Transport = &http.Transport{}
var client *http.Client = &http.Client{Transport: tr}
var url string = ""
var method string = "get"
var threads int = 1
var times int = 1
var minDelay int = 100
var maxDelay int = 1000
var closeConnection bool = false

func main() {
	flag.StringVar(&url, "url", "", "target url")
	flag.StringVar(&method, "method", "get", "HTTP method")
	flag.IntVar(&threads, "threads", 1, "number of threads to make requests")
	flag.IntVar(&times, "times", 1, "number of times to request for each thread")
	flag.IntVar(&minDelay, "minDelay", 100, "min time to wait before next request (ms)")
	flag.IntVar(&maxDelay, "maxDelay", 1000, "max time to wait before next request (ms)")
	flag.BoolVar(&closeConnection, "closeConnection", false, "Close connection? (default: false)")
	
	
	flag.Parse();
	if url == "" {
		fmt.Fprintf(os.Stderr, "args: no url specified\n")
		os.Exit(1)
	}
	if maxDelay <= minDelay {
		maxDelay = minDelay + 1
	}
	fmt.Printf("url            : %v\n", url)
	fmt.Printf("method         : %v\n", method)
	fmt.Printf("threads        : %v\n", threads)
	fmt.Printf("times          : %v\n", times)
	fmt.Printf("minDelay       : %v\n", minDelay)
	fmt.Printf("maxDelay       : %v\n", maxDelay)
	fmt.Printf("closeConnection: %v\n", closeConnection)
    
	start := time.Now()
	ch := make(chan string)
	for i := 0; i < threads; i++ {
		go clientSimulator(ch, i);
	}
	for i := 0; i < threads; i++ {
		fmt.Printf("%s\n", <-ch)
	}
	elapsedSecs := time.Since(start).Seconds()
	fmt.Printf("Total Elapsed Time: %.3f secs\n", elapsedSecs)
}

func clientSimulator(ch chan<- string, index int) {
	totalDuration := time.Duration(0)
	minDuration := time.Duration(1 * time.Hour)
	maxDuration := time.Duration(0)
	firstDuration := time.Duration(0)
	avgDuration := 0.0
	start := time.Now()
	for k := 0; k < times; k++ {
		delay := time.Duration(minDelay + rand.Intn(maxDelay - minDelay))
		time.Sleep(delay * time.Millisecond)
		
		reqStart := time.Now()
		resp, err := http.Get(url)
		if err != nil {
			fmt.Fprintf(os.Stderr, "clientSimulator: http.Get(%s) failed: %v\n", url, err)
			continue
		}
		if closeConnection {
			tr.CloseIdleConnections()
		} else {
			_, err = io.Copy(ioutil.Discard, resp.Body)
			if err != nil {
				fmt.Fprintf(os.Stderr, "clientSimulator: io.Copy() failed: %v\n", err)
				continue
			}
		}

		respDuration := time.Since(reqStart)
		if k == 0 {
			firstDuration = respDuration
		} else {
			totalDuration += respDuration
			switch {
				case respDuration < minDuration:
					minDuration = respDuration
				case respDuration > maxDuration:
					maxDuration = respDuration
			}
		}
		fmt.Printf("[%d, %d] Response Time: %.3f secs\n", index, k, respDuration.Seconds())
	}
	if times > 1 {
		avgDuration = totalDuration.Seconds()/(float64)(times - 1)
	}
	elapsedSecs := time.Since(start).Seconds()
	ch <- fmt.Sprintf("[%d] Times: %d, Elapsed: %.3f, First: %.3f, Min: %.3f, Max: %.3f, Avg: %.3f", 
		index, times, elapsedSecs, firstDuration.Seconds(), minDuration.Seconds(), maxDuration.Seconds(), avgDuration)
}
