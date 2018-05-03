import React, { Component } from 'react';
import './TrackList.css';
import Track from '../Track/Track';

class TrackList extends Component {
  render() {
    const trackList = this.props.trackList.map(track => <Track track={track} onAdd={this.props.onAdd} onRemove={this.props.onRemove} isRemovable={this.props.isRemovable}/>);
    return (
      <div className="TrackList">
          {trackList}
      </div>
    );
  }
}

export default TrackList;
