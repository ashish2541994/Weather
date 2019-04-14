import React from 'react'
import Button from '@material-ui/core/Button';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import 'react-open-weather/lib/css/ReactWeather.css';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
am4core.useTheme(am4themes_animated);

export default class Weather extends React.Component {
    constructor(props) {
        super(props);
        // Initialization of State Variables
        this.state = {
            counter: 0,
            isLoaded: false,
            isLoadedHourly: false,
            city: 'Mumbai',
            CF: false,
            unit: '&units=metric',
            unitExt: '°C',
        };
    }

    // Change City Handler
    handleChangeCity = event => {
        this.setState({
            [event.target.name]: event.target.value
        });
    };

    // Change C/F Handler
    handleChangeCF = name => event => {
        if (event.target.checked) {
            this.setState({
                [name]: event.target.checked,
                unit: '&units=imperial',//set Imperial for Faharenhite
            });
        } else {
            this.setState({
                [name]: event.target.checked,
                unit: '&units=metric',//set metric for Celcius
            });
        }
        this.getDailyWeather();
    };

    // Get 5Days Data for Weather Forecast
    getHourlyWeather = (e) => {
        //Clear Chart for new data
        if (this.chart) {
            this.chart.data = {};
        }
        //Clear Chart for current Time
        this.getDailyWeather();
        //Heat Api for 5Days/3Hour Data
        fetch("http://api.openweathermap.org/data/2.5/forecast/?q=" + this.state.city + "&appid=a2188e4352f73caa4790ce1e4ed63aa7" + this.state.unit)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        hourly: {
                            data: result
                        },
                    });
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )

        if (this.state.hourly) {

            var newData = [],dd, mm, yyyy, month,checkDuplicate = [];
            //Loop to get data Single Date data by eliminating Hourly 
            for (let i = 0; i < this.state.hourly.data.list.length; i++) {
                console.log(this.state.hourly.data.list[i].dt_txt);
                this.setState({
                    isLoadedHourly: false,

                });
                dd = new Date(this.state.hourly.data.list[i].dt_txt).getDate();
                mm = new Date(this.state.hourly.data.list[i].dt_txt).getMonth();
                yyyy = new Date(this.state.hourly.data.list[i].dt_txt).getFullYear();
                month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

                //Push Single Date Field in Chart array for Single Day Data
                if (!checkDuplicate.includes(dd + '-' + month[mm]) && checkDuplicate.length < 5) {
                    checkDuplicate.push(dd + '-' + month[mm]);
                    newData.push({
                        date: new Date(yyyy, mm, dd),
                        name: "name" + i,
                        value: this.state.hourly.data.list[i].main.temp + '°C'
                    });

                }
            }
            this.setState({
                uniqueDateArr: checkDuplicate,//Array for Single Date Button
                isLoadedHourly: true,
            });
            //initialization of Chart
            let chart = am4core.create("chartdiv", am4charts.XYChart);
            chart.paddingRight = 20;
            chart.data = newData;
            this.chart = chart;
            let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.grid.template.location = 0;

            let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
            valueAxis.tooltip.disabled = false;
            valueAxis.renderer.minWidth = 35;

            let series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.dateX = "date";
            series.dataFields.valueY = "value";

            series.tooltipText = "{valueY.value}";
            chart.cursor = new am4charts.XYCursor();

            let scrollbarX = new am4charts.XYChartScrollbar();
            scrollbarX.series.push(series);
            chart.scrollbarX = scrollbarX;
        }
        //set Units 
        if (this.state.unit == '&units=metric') {
            this.setState({
                unitExt: '°C'
            })
        } else {
            this.setState({
                unitExt: '°F'
            })
        }
    }

    //Single DateWise Hour Data
    datewise = (dateSelected) => {
        this.chart.data = {}
        console.log(dateSelected)
        var newData = [],
            dd, mm, yyyy, month;
        for (let i = 0; i < this.state.hourly.data.list.length; i++) {
            dd = new Date(this.state.hourly.data.list[i].dt * 1000).getDate();
            mm = new Date(this.state.hourly.data.list[i].dt * 1000).getMonth();
            month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
            if ((dd + '-' + month[mm]) == dateSelected) {
                newData.push({
                    date: new Date(this.state.hourly.data.list[i].dt * 1000),
                    name: "name" + i,
                    value: this.state.hourly.data.list[i].main.temp + '°C'
                });

            }

        }
        this.chart.data = newData;
    }

    //Get Daily Current Weather
    getDailyWeather = () => {
        fetch("https://api.openweathermap.org/data/2.5/weather?q=" + this.state.city + "&appid=a2188e4352f73caa4790ce1e4ed63aa7" + this.state.unit)
            .then(res => res.json())
            .then(
                (result) => {
                    this.setState({
                        weather: {
                            data: result,
                        },
                        icon: "//openweathermap.org/img/w/" + result.weather[0].icon + ".png",
                        date: result.dt * 1000
                    });
                },
                (error) => {
                    this.setState({

                        error
                    });
                }
            )
        // set Units
        if (this.state.unit == '&units=metric') {
            this.setState({
                unitExt: '°C'
            })
        } else {
            this.setState({
                unitExt: '°F'
            })
        }
    }

    //Will be Called after Render
    componentDidMount() {
        this.getHourlyWeather();
        this.setState({
            isLoaded: true,

        });
    }

    //Will be Called before Render
    componentWillUnmount() {
        if (this.chart) {
            this.chart.dispose();
        }
    }

    //render for View
    render() {
       return (
          <div>
            <h1>Weather forecast</h1>
                <FormControl>
                    <InputLabel htmlFor="city-simple">City</InputLabel>
                        <Select
                            value={this.state.city}
                            onChange={this.handleChangeCity}
                            inputProps={{
                                name: 'city',
                                id: 'city-simple',
                            }}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value={'Mumbai'}>Mumbai</MenuItem>
                            <MenuItem value={'Delhi'}>Delhi</MenuItem>
                            <MenuItem value={'Bangalore'}>Bangalore</MenuItem>
                            <MenuItem value={'Chennai'}>Chennai</MenuItem>
                            <MenuItem value={'Kolkata'}>Kolkata</MenuItem>
                            <MenuItem value={'Lucknow'}>Lucknow</MenuItem>
                            <MenuItem value={'Goa'}>Goa</MenuItem>
                        </Select>
                </FormControl>
                <FormControl>
                    <FormControlLabel
                        control={
                        <Switch
                            checked={this.state.CF}
                            onChange={this.handleChangeCF('CF')}
                            value="this.state.CF"
                            color="primary"
                        />
                        }
                        label="C/F"
                    /></FormControl>
       
                <Button variant="contained" color="primary" onClick={this.getHourlyWeather}>
                    Get 5 Day Weather
                </Button>
                { 
                    ((!this.state.isLoaded ))?( 
                    <p>Loading... </p>
                    ) : ( 
                        <div class="react-open-weather-map">
                            {(this.state.weather)?( 
                                <GridList cellHeight={200} cols={3}>
                                    <GridListTile cellHeight={200} >
                                        <div class="react-open-weather-map">
                                            <div class="temperature">Max Temp:- {this.state.weather.data.main.temp_max} {this.state.unitExt}</div>
                                            <div class="temperature">Min Temp:- {this.state.weather.data.main.temp_min} {this.state.unitExt}</div>
                                        </div>
                                    </GridListTile>
                                    <GridListTile >
                                        <div class="react-open-weather-map">
                                            {this.state.weather.data.name},{this.state.weather.data.sys.country}
                                            <div class="description">{this.state.weather.data.weather[0].main}</div>
                                            <div class="description">{this.state.weather.data.weather[0].description}</div>
                                            <div class="icon"><img src={this.state.icon} alt={this.state.weather.data.weather[0].main}/>
                                            </div><div class="temperature">Now:- {this.state.weather.data.main.temp} {this.state.unitExt}</div>
                                        </div>
                                    </GridListTile>
                                    <GridListTile >
                                        <div class="temperature">pressure:- {this.state.weather.data.main.pressure} </div>
                                        <div class="temperature">humidity:- {this.state.weather.data.main.humidity} </div> 
                                    </GridListTile>
                                </GridList>
                            ):(
                            <p>loading</p>
                            )}
                        </div>
                        ) 
        
                } 
                {(this.state.uniqueDateArr)?( 
                    <div>
                        <GridList cellHeight={40} cols={5}>
                            {this.state.uniqueDateArr.map((item, key) =>
                                <GridListTile >
                                    <Button  variant="outlined" color="primary" onClick={() => this.datewise(item)}>{item}</Button></GridListTile>
                            )}
                    </GridList>
                </div>
                ):(
                    <p></p>
                )}
                <div id="chartdiv" style={{ width: "100%", height: "400px" }}></div>
    
         </div>
      );
    }
}