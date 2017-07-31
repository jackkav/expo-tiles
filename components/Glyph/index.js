import React from 'react'
import { StyleSheet, Text, Animated } from 'react-native'
import { LETTER_SIZE, BORDER_RADIUS, TILE_SIZE } from '../../constants'
import { connect } from 'react-redux'
import { Speech } from 'expo'
import {
  selectGlyph,
  resetLevel,
  correct,
  incorrect,
  nextClue,
} from '../../ducks/actions'
const EXAMPLES = [
  { language: 'en', text: 'Hello world' },
  { language: 'es', text: 'Hola mundo' },
  { language: 'en', text: 'Charlie Cheever chased a chortling choosy child' },
  { language: 'en', text: 'Adam Perry ate a pear in pairs in Paris' },
]
export class Glyph extends React.Component {
  state = {
    selectedExample: EXAMPLES[0],
    inProgress: false,
    pitch: 1,
    rate: 0.75,
  }
  render() {
    this.anim = this.anim || new Animated.Value(0)
    this.coloranim = this.coloranim || new Animated.Value(0)
    const incorrectColor = 'rgba(255, 0, 0, 1)'
    return (
      <Animated.View
        key={this.props.id}
        style={[
          styles.tile,
          this.props.style,
          {
            backgroundColor: this.coloranim.interpolate({
              inputRange: [0, 300],
              outputRange: ['#BEE1D2', incorrectColor],
            }),
            transform: [
              // Array order matters
              {
                scale: this.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 4],
                }),
              },
              {
                translateX: this.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 500],
                }),
              },
              {
                rotate: this.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [
                    '0deg',
                    '360deg', // 'deg' or 'rad'
                  ],
                }),
              },
            ],
          },
        ]}
        onStartShouldSetResponder={() => {
          {
            /* this._speak() */
          }
          if (this.props.appData.zi === this.props.letter) {
            this.props.correct()
            this.props.nextClue()
            this._speak()
            this.clickCorrectTile(this.anim)
          } else {
            this.props.incorrect()
            this.clickWrongTile(this.anim)
          }

          return true
        }}
      >
        <Text style={styles.letter}>
          {this.props.letter}
        </Text>
      </Animated.View>
    )
  }
  _speak = () => {
    const start = () => {
      this.setState({ inProgress: true })
    }
    const complete = () => {
      this.state.inProgress && this.setState({ inProgress: false })
    }

    Speech.speak(this.props.letter, {
      language: 'zh',
      pitch: 0.45,
      rate: 0.3,
      onStart: start,
      onDone: complete,
      onStopped: complete,
      onError: complete,
    })
  }

  _stop = () => {
    Speech.stop()
  }
  clickWrongTile() {
    Animated.sequence([
      Animated.timing(this.coloranim, {
        toValue: 300,
      }),
      Animated.timing(this.coloranim, {
        toValue: 0,
      }),
    ]).start()
  }
  clickCorrectTile() {
    Animated.spring(this.anim, {
      toValue: 0, // Returns to the start
      velocity: 3, // Velocity makes it move
      tension: -10, // Slow
      friction: 1, // Oscillate a lot
    }).start()
  }
}

var styles = StyleSheet.create({
  tile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#BEE1D2',
  },
  letter: {
    color: '#333',
    fontSize: LETTER_SIZE,
    backgroundColor: 'transparent',
  },
})
function mapStateToProps(state) {
  return {
    appData: state.appData,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    selectGlyph: g => dispatch(selectGlyph(g)),
    resetLevel: g => dispatch(resetLevel()),
    correct: g => dispatch(correct()),
    nextClue: g => dispatch(nextClue()),
    incorrect: g => dispatch(incorrect()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Glyph)
