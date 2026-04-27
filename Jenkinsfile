pipeline {
    agent any

    environment {
        IMAGE_NAME = "dekohome-app"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Kod çekiliyor...'
                git branch: 'main', url: 'https://github.com/EbrarKarakoc/DekoHome.git'
            }
        }

        stage('Build & Deploy') {
            steps {
                echo 'Docker Compose ile build ve deploy yapılıyor...'
                sh 'docker compose down || true'
                withCredentials([string(credentialsId: 'MONGO_URI', variable: 'DB_URI')]) {
                    sh "MONGODB_URI=${DB_URI} docker compose up -d --build"
                }
            }
        }

        stage('Health Check') {
            steps {
                echo 'Sağlık kontrolü yapılıyor...'
                sleep 10
                sh 'curl -f http://localhost:3000/v1/health || exit 1'
            }
        }
    }

    post {
        success {
            echo 'CI/CD Süreci Başarıyla Tamamlandı!'
        }
        failure {
            echo 'Bir hata oluştu, lütfen logları kontrol edin.'
        }
    }
}
