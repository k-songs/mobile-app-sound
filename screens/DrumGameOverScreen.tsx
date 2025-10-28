import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Title from '../components/ui/Title';
import PrimaryButton from '../components/ui/PrimaryButton';
import Card from '../components/ui/Card';
import Colors from '../constants/Colors';
import LottieView from 'lottie-react-native'; 

// Lottie JSON 파일 임포트
const effortAnimation = require('../assets/lottie/effort.json');
const silverAnimation = require('../assets/lottie/shilvermedal.json'); 
const goldAnimation = require('../assets/lottie/shilvermedal.json'); 
interface DrumGameOverScreenProps {
  score: number;
  maxScore: number;
  onRestart: () => void;
  onGoHome: () => void;
}


interface GradeResult {
  grade: string;
  emoji: string; 
  message: string;
}

function DrumGameOverScreen({ score, maxScore, onRestart, onGoHome }: DrumGameOverScreenProps) {
  const percentage = Math.round((score / maxScore) * 100);
  const lottieRef = React.useRef<LottieView>(null);
  const animationEndFrame = 626; 

  const getGradeMessage = (): GradeResult => {
    // 새로운 채점 기준 적용
    if (maxScore === 5) { // 초급 난이도 (5문제)
      if (score === 5) return { grade: '최우수', emoji: '', message: '완벽합니다!' };
      if (score === 4) return { grade: '우수', emoji: '', message: '훌륭해요!' };
      if (score === 3) return { grade: '양호', emoji: '', message: '잘했어요!' };
      return { grade: '노력 필요', emoji: '', message: '더 연습해보세요!' };
    } else if (maxScore === 10) { // 중급 난이도 (10문제)
      if (score >= 9) return { grade: '최우수', emoji: '', message: '완벽합니다!' };
      if (score >= 7) return { grade: '우수', emoji: '', message: '훌륭해요!' };
      if (score >= 5) return { grade: '양호', emoji: '', message: '잘했어요!' };
      return { grade: '노력 필요', emoji: '', message: '더 연습해보세요!' };
    }
    // 기본값 (예상치 못한 maxScore 값의 경우)
    if (percentage >= 90) return { grade: '최우수', emoji: '', message: '완벽합니다!' };
    if (percentage >= 80) return { grade: '우수', emoji: '', message: '훌륭해요!' };
    if (percentage >= 70) return { grade: '양호', emoji: "", message: '잘했어요!' }; 
    if (percentage >= 60) return { grade: '보통', emoji: '', message: '좋은 시도예요!' };
    return { grade: '노력 필요', emoji: "", message: '더 연습해보세요!' }; 
  };

  const { grade, emoji, message } = getGradeMessage();


  const getLottieSource = () => {
    switch (grade) {
      case '양호':
        return goldAnimation; //
      case '보통':
        return silverAnimation; // 
      case '노력 필요':
        return effortAnimation; // 
      default:
        return null; // 
    }
  };
 
  const lottieSource = getLottieSource();

  React.useEffect(() => {
    if (lottieRef.current && lottieSource) {
      lottieRef.current.play();
    }
  }, [lottieSource]);

  const handleAnimationFinish = () => {
    if (lottieRef.current && lottieSource) {
      lottieRef.current.play(0, animationEndFrame);
    }
  };
 
  return (
    <View style={styles.container}>
      <Title>게임 완료!</Title>
      
      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          {emoji ? (
            <Text style={styles.emoji}>{emoji}</Text>
          ) : (
            // 등급에 따라 다른 Lottie 애니메이션 렌더링
            lottieSource && (
              <LottieView
                source={lottieSource}
                autoPlay
                loop
                style={styles.lottieAnimation}
                ref={lottieRef}
                onAnimationFinish={handleAnimationFinish}
              />
            )
          )}
          <Text style={styles.grade}>{grade}</Text>
        </View>
        
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {score} / {maxScore}
          </Text>
          <Text style={styles.percentageText}>
            정답률: {percentage}%
          </Text>
        </View>
        
        <Text style={styles.message}>{message}</Text>
      </Card>

      <View style={styles.buttonContainer}>
        <PrimaryButton 
          onPress={onRestart}
          style={styles.button}
        >
          <Text style={styles.buttonText}>다시 도전</Text>
        </PrimaryButton>
        
        <PrimaryButton 
          onPress={onGoHome}
          style={[styles.button, styles.secondaryButton]}
        >
          <Text style={styles.buttonText}>나가기</Text>
        </PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultCard: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 30,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  grade: {
    fontSize: 24,
    fontFamily: 'open-sans-bold',
    color: Colors.primary800,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 36,
    fontFamily: 'open-sans-bold',
    color: Colors.primary600,
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 18,
    fontFamily: 'open-sans',
    color: Colors.primary700,
  },
  message: {
    fontSize: 16,
    fontFamily: 'open-sans',
    textAlign: 'center',
    color: Colors.primary800,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    marginHorizontal: 20,
  },
  secondaryButton: {
    backgroundColor: Colors.accent500,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'open-sans-bold',
  },
  lottieAnimation: {
    width: 140,
    height: 140,
  },
});

export default DrumGameOverScreen;