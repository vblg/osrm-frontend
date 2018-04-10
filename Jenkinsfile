@Library('jenkins-libs')
import ru.etecar.Libs
import ru.etecar.HelmClient
import ru.etecar.HelmRelease
import ru.etecar.HelmRepository

node ('gce-standard-4-ssd') {
    cleanWs()
    checkout scm
    stage ('Build image') {
        def imageRepo = 'eu.gcr.io/indigo-terra-120510'
        def appName = 'osrm-frontend'
        def imageTag = "0.0.1-${env.BUILD_NUMBER}"
        withCredentials([file(credentialsId: 'google-docker-repo', variable: 'CREDENTIALS')]) {
            sh "docker login -u _json_key -p\"${CREDENTIALS}\" https://eu.gcr.io"
        }
        sh "docker build . -f docker/Dockerfile -t ${imageRepo}/${appName}:${imageTag} && docker push ${imageRepo}/${appName}:${imageTag}"
    }
}

node ('docker-server'){
    Libs utils = new Libs(steps)
    HelmClient helm = new HelmClient(steps)
    HelmRepository repo = new HelmRepository(steps,"helmrepo","https://nexus:8443/repository/helmrepo/")
    try {
        cleanWs()
        def appName = 'osrm-frontend'
        kubeProdContext = "google-system"
        def imageTag = "0.0.1-${env.BUILD_NUMBER}"

        checkout scm
        helm.init('helm')
        helm.repoAdd(repo)

        stage('Build helm'){
            withCredentials([usernameColonPassword(credentialsId: "nexus", variable: 'CREDENTIALS')]) {
                repo.push(helm.buildPacket("helm/${appName}/Chart.yaml"), CREDENTIALS, "helm-repo")
            }
        }

        stage ('Production') {
            def stage = "production"
            def apiProdHostname = "maps.etecar.ru"
            HelmRelease osrmFrontendRelease = new HelmRelease(steps, "${appName}", "helmrepo/${appName}")

            try {
                helm.tillerNamespace = "kube-system"
                helm.kubeContext = kubeProdContext

                osrmFrontendRelease.namespace = "${stage}"
                osrmFrontendRelease.values = [
                        "ingress.enabled":"true",
                        "ingress.hosts[0]":"${ apiProdHostname}",
                        "image.tag" : "${imageTag}"
                ]
                helm.upgrade( osrmFrontendRelease )
                helm.waitForDeploy(osrmFrontendRelease, 400)
            } catch (e) {
                helm.rollback(osrmFrontendRelease)
                throw e
            }
        }
    } catch (e) {
        utils.sendMail("${env.JOB_NAME} (${env.BUILD_NUMBER}) has finished with FAILED", "See ${env.BUILD_URL}")
        throw e
    }
}
