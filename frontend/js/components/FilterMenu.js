import React from "react";

import FacultyList from "./FacultyList.js";
import SearchField from "./SearchField.js";
import SemesterButton from "./SemesterButton.js";

export default class FilterMenu extends React.Component {
	render(){
		var faculties = [];

		for(var key in this.props.faclist){
			faculties.push(<FacultyList	key={key}
										code={key}
										faculty={this.props.faclist[key]}
										notifyInstituteToggle={this.props.notifyInstituteToggle}
										notifyFacultyToggle={this.props.notifyFacultyToggle}
										layoutobj={this.props.layoutobj} />);
		}

		return (
			<div className="filtermenu">
				<h1>Eksamenskalender for UiO</h1>
				{/* Switching between semesters is currently disabled to simplify the UI

				<SemesterButton 
				activeSemester={this.props.activeSemester}
				semester1={this.props.semester1}
				sem1examcount={this.props.sem1examcount}
				semester2={this.props.semester2}
				sem2examcount={this.props.sem2examcount}
				notifySemesterToggle={this.props.notifySemesterToggle.bind(this.props.layoutobj)} />
				
				*/}
				<SearchField notifySearchFieldChange={this.props.notifySearchFieldChange}/>

				<div className="menu-wrapper">
					<div className="menu">
						{faculties}
					</div>
				</div>
			</div>
		);
	}
}