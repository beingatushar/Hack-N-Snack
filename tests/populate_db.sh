#!/bin/sh
# Smart Quiz Hub — Demo Data Seeder
# Runs inside Docker network via the seeder service in docker-compose.yml
# Connects directly to postgres:5432 (after backend/Flyway have finished)
#
# User IDs : admin=1, gaurav=2, birendra=3, divya=4, swati=5, indugu=6
# Stack IDs: SpringCloud=1, SpringBoot=2, SpringCore=3, SpringMVC=4, ORM=5, CoreJava=6
# Topic IDs: Cloud(1-7), Boot(8-14), Core(15-19), MVC(20-24), ORM(25-29), Java(30-34)

set -e

echo "[seeder] Checking existing question count..."
EXISTING=$(PGPASSWORD="$PGPASSWORD" psql -h postgres -U "$DB_USERNAME" -d "$DB_NAME" -t -c \
  "SELECT COUNT(*) FROM mcq_questions" 2>/dev/null | tr -d ' \n')

if [ "${EXISTING:-0}" -gt "10" ]; then
  echo "[seeder] Already seeded ($EXISTING questions found). Skipping."
  exit 0
fi

echo "[seeder] Inserting ~115 demo questions across all stacks and statuses..."

PGPASSWORD="$PGPASSWORD" psql -h postgres -U "$DB_USERNAME" -d "$DB_NAME" -v ON_ERROR_STOP=1 << 'SQL'

INSERT INTO mcq_questions
  (question_stem, options, correct_option_indices, difficulty,
   stack_id, topic_id, status, creator_id, reviewer_id, reviewer_comments,
   submitted_at, assigned_at, reviewed_at, created_at, updated_at)
VALUES

-- ═══════════════════════════════════════════════════════
-- SPRING CLOUD  (stack=1)
-- gaurav (2) creates Q1-10, reviewed by divya (4)
-- divya  (4) creates Q11-20, reviewed by gaurav (2)
-- indugu (6) creates Q21-30, reviewed by gaurav (2)
-- ═══════════════════════════════════════════════════════

-- Q1 APPROVED
('What is the primary purpose of Spring Cloud in a microservices architecture?',
 '["To replace Spring Boot entirely","To provide tools for distributed systems like service discovery, config management, and circuit breakers","To manage database transactions","To serve as an embedded web server"]'::jsonb,
 '[1]'::jsonb, 'EASY', 1, 1, 'APPROVED', 2, 4, 'Well-framed question with good distractors.',
 NOW()-INTERVAL '13 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '14 days', NOW()-INTERVAL '11 days'),

-- Q2 APPROVED
('Which annotation designates a Spring Boot application as a Eureka Server?',
 '["@EnableDiscoveryClient","@EnableEurekaClient","@EnableEurekaServer","@EurekaServiceRegistry"]'::jsonb,
 '[2]'::jsonb, 'EASY', 1, 2, 'APPROVED', 2, 4, 'Correct and clear.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q3 APPROVED
('What is the default port on which Eureka Server starts?',
 '["8080","8761","9090","5000"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 2, 'APPROVED', 2, 4, 'Good factual question.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q4 REJECTED
('Spring Cloud is an alternative to using Spring Boot for all applications.',
 '["True","False","Only for microservices","Depends on JVM version"]'::jsonb,
 '[1]'::jsonb, 'EASY', 1, 1, 'REJECTED', 2, 4, 'The question reads like a True/False statement. Rephrase it as a proper MCQ.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q5 REJECTED
('In Eureka, how frequently does a registered client send heartbeat signals by default?',
 '["Every 10 seconds","Every 30 seconds","Every 60 seconds","Every 5 seconds"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 3, 'REJECTED', 2, 4, 'Correct answer, but all four options look too similar. Increase distractor variety.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q6 UNDER_REVIEW
('What does Eureka Self-Preservation mode prevent?',
 '["Server restart","Evicting healthy instances when a network partition causes heartbeat drops","Memory overflow","Config server connection loss"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 3, 'UNDER_REVIEW', 2, 4, NULL,
 NOW()-INTERVAL '4 days', NOW()-INTERVAL '3 days', NULL, NOW()-INTERVAL '5 days', NOW()-INTERVAL '3 days'),

-- Q7 UNDER_REVIEW
('Which Spring Cloud annotation enables client-side load balancing on a RestTemplate bean?',
 '["@EnableLoadBalancer","@LoadBalanced","@RibbonClient","@ClientSideLoadBalancer"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 4, 'UNDER_REVIEW', 2, 4, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q8 READY_FOR_REVIEW
('What is the default load balancing algorithm used by Spring Cloud LoadBalancer?',
 '["Random","Weighted Response Time","Round Robin","Least Connections"]'::jsonb,
 '[2]'::jsonb, 'EASY', 1, 4, 'READY_FOR_REVIEW', 2, NULL, NULL,
 NOW()-INTERVAL '2 days', NULL, NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days'),

-- Q9 READY_FOR_REVIEW
('What is Spring Cloud OpenFeign?',
 '["A REST documentation tool","A declarative HTTP client that integrates with service discovery","A load balancer","An embedded Tomcat replacement"]'::jsonb,
 '[1]'::jsonb, 'EASY', 1, 5, 'READY_FOR_REVIEW', 2, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q10 DRAFT
('Which Resilience4J annotation applies the circuit breaker pattern to a Spring method?',
 '["@BreakerPattern","@CircuitBreaker","@FaultTolerant","@Resilience"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 6, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW()-INTERVAL '1 day', NOW()-INTERVAL '1 day'),

-- Q11 APPROVED (divya creates, gaurav reviews)
('Which three states can a Resilience4J circuit breaker be in?',
 '["OPEN, CLOSED, PENDING","CLOSED, OPEN, HALF_OPEN","ACTIVE, INACTIVE, TESTING","START, STOP, PAUSE"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 6, 'APPROVED', 4, 2, 'Accurate and well-structured.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q12 APPROVED
('What happens to incoming requests when a circuit breaker is in OPEN state?',
 '["They are queued for retry","They fail immediately and a fallback is triggered","They are forwarded to another service","They time out after 30 seconds"]'::jsonb,
 '[1]'::jsonb, 'HARD', 1, 6, 'APPROVED', 4, 2, 'Good advanced-level question.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q13 APPROVED
('What does Spring Boot Actuator provide out of the box?',
 '["Database migration tools","Production-ready endpoints for health, metrics, and monitoring","A UI dashboard for microservices","An API gateway"]'::jsonb,
 '[1]'::jsonb, 'EASY', 1, 7, 'APPROVED', 4, 2, 'Clear and correct.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q14 APPROVED
('Which HTTP endpoint does Spring Boot Actuator expose for health checks?',
 '["/health","/actuator/health","/status","/ping"]'::jsonb,
 '[1]'::jsonb, 'EASY', 1, 7, 'APPROVED', 4, 2, 'Straightforward and accurate.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q15 REJECTED
('To expose all Spring Boot Actuator endpoints over HTTP, which property must be set?',
 '["actuator.expose=all","management.endpoints.web.exposure.include=*","spring.actuator.web=true","endpoints.all=enabled"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 7, 'REJECTED', 4, 2, 'Correct answer, but phrasing is confusing. Simplify the question stem.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q16 MODIFICATION_REQUESTED
('Which annotation on a service interface enables Spring Cloud OpenFeign?',
 '["@RestClient","@FeignClient","@WebClient","@ServiceProxy"]'::jsonb,
 '[1]'::jsonb, 'EASY', 1, 5, 'MODIFICATION_REQUESTED', 4, 2, 'Correct but please add a short scenario context to the stem.',
 NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '4 days'),

-- Q17 UNDER_REVIEW
('How does Spring Cloud OpenFeign integrate with Eureka for service discovery?',
 '["It uses hardcoded URLs","It resolves the service name from Eureka registry to the actual host and port","It requires manual IP configuration","It uses DNS resolution only"]'::jsonb,
 '[1]'::jsonb, 'HARD', 1, 5, 'UNDER_REVIEW', 4, 2, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q18 UNDER_REVIEW
('What is a microservice in the context of Spring Cloud?',
 '["A small UI component","An independently deployable service with a single business responsibility","A database module","A configuration class"]'::jsonb,
 '[1]'::jsonb, 'EASY', 1, 1, 'UNDER_REVIEW', 4, 2, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q19 READY_FOR_REVIEW
('Which Spring Cloud component acts as an API Gateway for routing requests to microservices?',
 '["Eureka","Spring Cloud Config","Spring Cloud Gateway","Feign"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 1, 1, 'READY_FOR_REVIEW', 4, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q20 DRAFT
('What is the role of Spring Cloud Config Server in a microservices setup?',
 '["Manages database connections","Provides centralized external configuration for all services","Handles authentication","Manages service versioning"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 1, 'DRAFT', 4, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q21 APPROVED (indugu creates, gaurav reviews)
('Which dependency adds Eureka Server support to a Spring Boot application?',
 '["spring-cloud-starter-eureka","spring-cloud-starter-netflix-eureka-server","spring-boot-starter-discovery","spring-cloud-netflix"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 2, 'APPROVED', 6, 2, 'Correct. Good for differentiating client vs server starters.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q22 APPROVED
('When a Eureka client cannot reach the Eureka Server, what does it fall back to?',
 '["It stops working","It uses the locally cached registry from its last successful fetch","It retries indefinitely","It contacts the database directly"]'::jsonb,
 '[1]'::jsonb, 'HARD', 1, 2, 'APPROVED', 6, 2, 'Excellent advanced question on resilience.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q23 APPROVED
('In Resilience4J, what triggers a transition from OPEN to HALF_OPEN state?',
 '["A manual reset command","Expiry of a configured wait duration","A new service deployment","A health check pass"]'::jsonb,
 '[1]'::jsonb, 'HARD', 1, 6, 'APPROVED', 6, 2, 'Precise and challenging.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q24 REJECTED
('Which property disables service registration with Eureka for a specific application?',
 '["eureka.server.enabled=false","eureka.client.register-with-eureka=false","spring.eureka.register=false","eureka.instance.active=false"]'::jsonb,
 '[1]'::jsonb, 'HARD', 1, 2, 'REJECTED', 6, 2, 'Answer is correct but distractors are not realistic enough.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q25 REJECTED
('The half-open state in Resilience4J allows limited requests to test service recovery.',
 '["False","True","Only in timeout scenarios","Only when manually triggered"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 6, 'REJECTED', 6, 2, 'Formatted as True/False. Rewrite as a proper MCQ.',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days'),

-- Q26 MODIFICATION_REQUESTED
('What information does a service instance register with Eureka Server?',
 '["Only its port number","Hostname, port, health check URL, and metadata","Only the service name","Database connection string"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 2, 'MODIFICATION_REQUESTED', 6, 2, 'Good question. Please add a practical scenario to the stem.',
 NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '4 days'),

-- Q27 MODIFICATION_REQUESTED
('What does the @Retry annotation from Resilience4J do?',
 '["Creates a retry policy for HTTP clients","Automatically retries a failed method a configured number of times","Retries database transactions","Restarts the Spring context on failure"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 1, 6, 'MODIFICATION_REQUESTED', 6, 2, 'Reasonable question. Add a real-world use case to strengthen the stem.',
 NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '3 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '3 days'),

-- Q28 UNDER_REVIEW
('Which Spring Cloud LoadBalancer policy selects service instances in sequential order?',
 '["RandomLoadBalancer","WeightedResponseTimeLoadBalancer","RoundRobinLoadBalancer","LeastConnectionsLoadBalancer"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 1, 4, 'UNDER_REVIEW', 6, 2, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q29 UNDER_REVIEW
('Which interface does Spring Cloud LoadBalancer use to list available service instances?',
 '["ServiceLocator","DiscoveryClient","InstanceRegistry","ServiceRegistry"]'::jsonb,
 '[1]'::jsonb, 'HARD', 1, 4, 'UNDER_REVIEW', 6, 2, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q30 DRAFT
('How can you define a fallback method for a Feign client when the remote service is unavailable?',
 '["Implement FallbackFactory","Use @FeignClient fallback attribute pointing to a class implementing the interface","Use @Fallback on the method","Annotate with @RetryOnFailure"]'::jsonb,
 '[1]'::jsonb, 'HARD', 1, 5, 'DRAFT', 6, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- ═══════════════════════════════════════════════════════
-- SPRING BOOT  (stack=2)
-- birendra (3) creates Q31-45, reviewed by swati (5)
-- swati   (5) creates Q46-59, reviewed by birendra (3)
-- ═══════════════════════════════════════════════════════

-- Q31 APPROVED
('What is the main advantage of Spring Boot over traditional Spring Framework?',
 '["It removes the need for a JVM","It eliminates boilerplate configuration through auto-configuration and embedded servers","It only supports REST APIs","It is faster at runtime than Spring"]'::jsonb,
 '[1]'::jsonb, 'EASY', 2, 8, 'APPROVED', 3, 5, 'Well-articulated.',
 NOW()-INTERVAL '13 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '14 days', NOW()-INTERVAL '11 days'),

-- Q32 APPROVED
('What is a Spring Boot Starter?',
 '["A code generator","A pre-configured dependency descriptor that bundles related libraries","A Spring Boot plugin for IDEs","An annotation that starts the Spring context"]'::jsonb,
 '[1]'::jsonb, 'EASY', 2, 10, 'APPROVED', 3, 5, 'Correct and concise.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q33 APPROVED
('The @SpringBootApplication annotation combines which three annotations?',
 '["@Component, @Autowired, @Bean","@Configuration, @EnableAutoConfiguration, @ComponentScan","@SpringMVC, @SpringData, @SpringSecurity","@RestController, @Service, @Repository"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 11, 'APPROVED', 3, 5, 'Accurate and appropriately challenging.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q34 APPROVED
('What does @EnableAutoConfiguration in Spring Boot do?',
 '["Enables XML configuration","Automatically configures Spring beans based on classpath dependencies","Starts all Spring services","Enables AOP proxying"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 11, 'APPROVED', 3, 5, 'Good.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q35 APPROVED
('What does SpringApplication.run() return?',
 '["void","ApplicationContext","ConfigurableApplicationContext","BeanFactory"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 2, 12, 'APPROVED', 3, 5, 'Correct. Good API knowledge check.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q36 REJECTED
('Spring Boot auto-configuration classes in Spring Boot 3.x are registered via which file?',
 '["spring.factories","AutoConfiguration.imports","beans.xml","application.yml"]'::jsonb,
 '[1]'::jsonb, 'HARD', 2, 13, 'REJECTED', 3, 5, 'Option text is incomplete. The correct answer should read META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q37 REJECTED
('spring-boot-starter-web includes which embedded server by default?',
 '["Jetty","Undertow","Apache Tomcat","GlassFish"]'::jsonb,
 '[2]'::jsonb, 'EASY', 2, 10, 'REJECTED', 3, 5, 'Correct answer is Apache Tomcat (index 2), verify your index mapping before resubmitting.',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days'),

-- Q38 MODIFICATION_REQUESTED
('How do you exclude a specific auto-configuration class in Spring Boot?',
 '["Remove it from the classpath","Use @SpringBootApplication(exclude={SomeAutoConfig.class})","Set spring.autoconfigure.exclude in application.properties","Both B and C are valid"]'::jsonb,
 '[3]'::jsonb, 'MEDIUM', 2, 13, 'MODIFICATION_REQUESTED', 3, 5, 'Correct, but choose ONE preferred approach to avoid multi-answer ambiguity.',
 NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '4 days'),

-- Q39 MODIFICATION_REQUESTED
('What does @ConditionalOnClass do in Spring Boot auto-configuration?',
 '["Configures logging","Creates a bean only if a specified class is present on the classpath","Skips auto-configuration entirely","Enables classpath scanning"]'::jsonb,
 '[1]'::jsonb, 'HARD', 2, 13, 'MODIFICATION_REQUESTED', 3, 5, 'Correct. Please rephrase to include a short code-snippet context in the stem.',
 NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '3 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '3 days'),

-- Q40 UNDER_REVIEW
('Which interface allows running custom code after the Spring Boot application context is ready?',
 '["ApplicationListener","CommandLineRunner","SpringRunner","BeanPostProcessor"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 12, 'UNDER_REVIEW', 3, 5, NULL,
 NOW()-INTERVAL '4 days', NOW()-INTERVAL '3 days', NULL, NOW()-INTERVAL '5 days', NOW()-INTERVAL '3 days'),

-- Q41 UNDER_REVIEW
('Spring Boot DevTools triggers an application restart when it detects changes in which location?',
 '["src/main/java only","The configured classpath — typically target/classes","The application.properties file","Any file in the project"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 14, 'UNDER_REVIEW', 3, 5, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q42 UNDER_REVIEW
('Spring Boot DevTools uses two classloaders to speed up restarts. What does the restart classloader reload?',
 '["All JVM classes","Only the application code; third-party library classes remain loaded","Only static resources","Only configuration files"]'::jsonb,
 '[1]'::jsonb, 'HARD', 2, 14, 'UNDER_REVIEW', 3, 5, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q43 READY_FOR_REVIEW
('What is the purpose of @ConfigurationProperties in Spring Boot?',
 '["Marks a class as a configuration file","Binds external configuration properties from application.yml or application.properties to a POJO","Defines bean creation order","Enables security configuration"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 13, 'READY_FOR_REVIEW', 3, NULL, NULL,
 NOW()-INTERVAL '2 days', NULL, NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days'),

-- Q44 READY_FOR_REVIEW
('Which Spring Boot Starter includes JUnit 5, Mockito, and AssertJ?',
 '["spring-boot-starter-validation","spring-boot-starter-aop","spring-boot-starter-test","spring-test"]'::jsonb,
 '[2]'::jsonb, 'EASY', 2, 10, 'READY_FOR_REVIEW', 3, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q45 DRAFT
('How do you specify the active Spring profile when starting a Spring Boot application?',
 '["spring.active.profile=dev","spring.profiles.active=dev in application.properties","--active-profile=dev command line","profile.active=dev in bootstrap.yml"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 9, 'DRAFT', 3, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q46 APPROVED (swati creates, birendra reviews)
('Which tool is used to generate a Spring Boot project skeleton with desired dependencies?',
 '["Spring CLI","Spring Initializr at start.spring.io","Maven Archetype only","Eclipse Plugin"]'::jsonb,
 '[1]'::jsonb, 'EASY', 2, 9, 'APPROVED', 5, 3, 'Simple and accurate.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q47 APPROVED
('What is the default embedded server in spring-boot-starter-web?',
 '["Jetty","GlassFish","Apache Tomcat","Undertow"]'::jsonb,
 '[2]'::jsonb, 'EASY', 2, 9, 'APPROVED', 5, 3, 'Correct. Classic factual question.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q48 APPROVED
('What does spring-boot-starter-data-jpa pull in as its default JPA provider?',
 '["EclipseLink","OpenJPA","Hibernate","TopLink"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 2, 10, 'APPROVED', 5, 3, 'Good.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q49 APPROVED
('How does Spring Boot LiveReload in DevTools help during development?',
 '["It restarts the JVM automatically","It automatically refreshes the browser when static resources change","It compiles Java files on save","It syncs code with the git repository"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 14, 'APPROVED', 5, 3, 'Good practical question.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q50 REJECTED
('Spring Boot convention over configuration means the developer must configure everything explicitly.',
 '["True","False","Only for security","Only in production"]'::jsonb,
 '[1]'::jsonb, 'EASY', 2, 8, 'REJECTED', 5, 3, 'True/False format is not acceptable. Rephrase as a proper MCQ.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q51 REJECTED
('The @Value annotation in Spring Boot injects values from?',
 '["Only hardcoded strings","application.properties, environment variables, or other property sources","Only from System.getenv()","Only from application.yml"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 8, 'REJECTED', 5, 3, 'Correct, but option C is too similar to B. Improve the distractors.',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days'),

-- Q52 UNDER_REVIEW
('When packaging a Spring Boot application as a fat JAR, what does it include?',
 '["Only the compiled application classes","Application classes, all dependencies, and the embedded server","Only the source files","The application classes and a manifest file only"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 9, 'UNDER_REVIEW', 5, 3, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q53 UNDER_REVIEW
('What is the purpose of @ConditionalOnMissingBean in Spring Boot?',
 '["Creates a bean regardless of context","Creates a bean only if no bean of that type already exists in the context","Disables bean auto-creation","Marks a bean as optional"]'::jsonb,
 '[1]'::jsonb, 'HARD', 2, 13, 'UNDER_REVIEW', 5, 3, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q54 READY_FOR_REVIEW
('How do you change the default port of a Spring Boot application?',
 '["Modify web.xml","Set server.port in application.properties or application.yml","Pass --http.port at startup","Override TomcatServletWebServerFactory bean"]'::jsonb,
 '[1]'::jsonb, 'EASY', 2, 9, 'READY_FOR_REVIEW', 5, NULL, NULL,
 NOW()-INTERVAL '2 days', NULL, NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days'),

-- Q55 READY_FOR_REVIEW
('Which annotation binds a class to a group of properties in application.properties?',
 '["@PropertySource","@ConfigurationProperties","@Value","@BindProperties"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 13, 'READY_FOR_REVIEW', 5, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q56 READY_FOR_REVIEW
('What does spring-boot-starter-security enable by default when added to the classpath?',
 '["OAuth2 login only","Form-based login and HTTP Basic authentication with an auto-generated password","JWT token support","LDAP authentication"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 10, 'READY_FOR_REVIEW', 5, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q57 DRAFT
('What does @ComponentScan do in a Spring Boot application?',
 '["Scans for UI components","Instructs Spring to scan specified packages for @Component, @Service, @Repository, and similar annotated classes","Monitors component health","Compiles components at startup"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 11, 'DRAFT', 5, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q58 DRAFT
('How do you run code once after the application context is ready using a functional interface?',
 '["@PostConstruct on main method","Implement ApplicationRunner with a run() method","Use Thread.sleep in main()","Override SpringApplication.run()"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 12, 'DRAFT', 5, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q59 DRAFT
('Which property controls the Hibernate DDL strategy in a Spring Boot application?',
 '["jpa.generate-ddl=true","spring.jpa.hibernate.ddl-auto=update","hibernate.schema.mode=create","spring.datasource.schema=auto"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 2, 8, 'DRAFT', 5, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- ═══════════════════════════════════════════════════════
-- SPRING CORE  (stack=3)
-- gaurav (2) creates Q60-74, reviewed by admin (1)
-- ═══════════════════════════════════════════════════════

-- Q60 APPROVED
('What is Dependency Injection in the context of Spring Framework?',
 '["A design pattern where a class creates its own dependencies","A pattern where dependencies are provided to a class externally, promoting loose coupling","A way to inject SQL into queries","A mechanism for database connection pooling"]'::jsonb,
 '[1]'::jsonb, 'EASY', 3, 15, 'APPROVED', 2, 1, 'Excellent foundational question.',
 NOW()-INTERVAL '13 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '14 days', NOW()-INTERVAL '11 days'),

-- Q61 APPROVED
('Which type of Dependency Injection does Spring recommend as a best practice?',
 '["Field injection with @Autowired on fields","Setter injection","Constructor injection","Method injection"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 3, 15, 'APPROVED', 2, 1, 'Correct and important for best practice knowledge.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q62 APPROVED
('What is the default scope of a Spring bean when no scope is specified?',
 '["Prototype","Session","Singleton","Request"]'::jsonb,
 '[2]'::jsonb, 'EASY', 3, 17, 'APPROVED', 2, 1, 'Correct. Classic knowledge check.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q63 APPROVED
('What does Inversion of Control mean in Spring?',
 '["The developer controls all object creation","The Spring container takes control of object creation, configuration, and lifecycle","The application inverts its database schema","Control flow is inverted from top-down to bottom-up"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 3, 16, 'APPROVED', 2, 1, 'Good conceptual question.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q64 APPROVED
('The @PostConstruct annotation marks a method that is called at which point in the bean lifecycle?',
 '["Before dependency injection","After dependency injection completes, before the bean is used","When the bean is destroyed","During classpath scanning"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 3, 17, 'APPROVED', 2, 1, 'Accurate and well-phrased.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q65 APPROVED
('What is the functional difference between @Component and @Service in Spring?',
 '["@Service adds database support","They are functionally equivalent; @Service communicates the intended role in the service layer","@Component is only for controllers","@Service adds transaction management automatically"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 3, 18, 'APPROVED', 2, 1, 'Good semantic question.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q66 REJECTED
('ApplicationContext is a subinterface of BeanFactory and extends its features.',
 '["False","True","Only in Spring Boot","Only with XML configuration"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 3, 19, 'REJECTED', 2, 1, 'True/False format. Rewrite as a proper MCQ with meaningful distractors.',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days'),

-- Q67 REJECTED
('What happens to a prototype-scoped Spring bean after creation and injection?',
 '["Spring continues managing it","Spring hands it to the caller and no longer manages its lifecycle","It is destroyed immediately","It gets registered in the singleton registry"]'::jsonb,
 '[1]'::jsonb, 'HARD', 3, 17, 'REJECTED', 2, 1, 'Correct answer but the stem is too abstract. Add a realistic scenario.',
 NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '4 days'),

-- Q68 UNDER_REVIEW
('What does the @Repository annotation add beyond what @Component provides?',
 '["Automatic CRUD methods","Persistence exception translation that wraps data access exceptions into Spring DataAccessException","Transaction management","A JPA EntityManager"]'::jsonb,
 '[1]'::jsonb, 'HARD', 3, 18, 'UNDER_REVIEW', 2, 1, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q69 UNDER_REVIEW
('Which ApplicationContext implementation is suited for standalone Java-based Spring configuration?',
 '["ClassPathXmlApplicationContext","WebApplicationContext","AnnotationConfigApplicationContext","FileSystemXmlApplicationContext"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 3, 19, 'UNDER_REVIEW', 2, 1, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q70 READY_FOR_REVIEW
('Which annotation creates a Spring bean from a method in a @Configuration class?',
 '["@Component","@Service","@Bean","@Inject"]'::jsonb,
 '[2]'::jsonb, 'EASY', 3, 18, 'READY_FOR_REVIEW', 2, NULL, NULL,
 NOW()-INTERVAL '2 days', NULL, NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days'),

-- Q71 READY_FOR_REVIEW
('What does @Autowired do when applied to a constructor in Spring?',
 '["Marks the class as a component","Tells Spring to inject required dependencies when creating the bean","Declares a REST endpoint","Configures a data source"]'::jsonb,
 '[1]'::jsonb, 'EASY', 3, 15, 'READY_FOR_REVIEW', 2, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q72 DRAFT
('What is the difference between BeanFactory and ApplicationContext in Spring?',
 '["BeanFactory and ApplicationContext are identical","BeanFactory is a basic IoC container; ApplicationContext adds AOP, event publishing, and i18n support","BeanFactory supports only XML config","ApplicationContext is only for web applications"]'::jsonb,
 '[1]'::jsonb, 'HARD', 3, 19, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q73 DRAFT
('Which annotation enables classpath scanning for Spring-managed components?',
 '["@EnableComponents","@ComponentScan","@ScanBeans","@ContextRefresh"]'::jsonb,
 '[1]'::jsonb, 'EASY', 3, 18, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q74 DRAFT
('What does the @PreDestroy annotation mark in a Spring bean?',
 '["Initialization logic","A method called just before the bean is removed from the container","The bean destruction scope","A fallback method"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 3, 17, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- ═══════════════════════════════════════════════════════
-- SPRING MVC & REST  (stack=4)
-- divya (4) creates Q75-88, reviewed by admin (1)
-- ═══════════════════════════════════════════════════════

-- Q75 APPROVED
('What is the role of DispatcherServlet in Spring MVC?',
 '["It manages database connections","It acts as the front controller, routing incoming requests to appropriate handlers","It renders HTML templates","It handles authentication"]'::jsonb,
 '[1]'::jsonb, 'EASY', 4, 20, 'APPROVED', 4, 1, 'Correct and clear.',
 NOW()-INTERVAL '13 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '14 days', NOW()-INTERVAL '11 days'),

-- Q76 APPROVED
('@RestController in Spring MVC is equivalent to combining which two annotations?',
 '["@Controller + @RequestMapping","@Controller + @ResponseBody","@Service + @ResponseBody","@Component + @RequestMapping"]'::jsonb,
 '[1]'::jsonb, 'EASY', 4, 21, 'APPROVED', 4, 1, 'Accurate.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q77 APPROVED
('Which annotation extracts a value from a URI path template such as /users/{id}?',
 '["@RequestParam","@PathVariable","@RequestBody","@QueryParam"]'::jsonb,
 '[1]'::jsonb, 'EASY', 4, 22, 'APPROVED', 4, 1, 'Good.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q78 APPROVED
('@ControllerAdvice in Spring MVC is used for?',
 '["Configuring database connections","Providing global exception handling across all controllers","Enabling caching","Managing bean scopes"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 4, 23, 'APPROVED', 4, 1, 'Clear and important.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q79 APPROVED
('What is the purpose of the Accept header in an HTTP request to a Spring REST API?',
 '["To authenticate the request","To specify the media type the client expects in the response","To set the request timeout","To indicate the request body format"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 4, 24, 'APPROVED', 4, 1, 'Precise.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q80 REJECTED
('@GetMapping is shorthand for which annotation?',
 '["@RequestMapping(type=GET)","@RequestMapping(method=RequestMethod.GET)","@Mapping(HTTP.GET)","@RequestGET"]'::jsonb,
 '[1]'::jsonb, 'EASY', 4, 22, 'REJECTED', 4, 1, 'Too trivial. Add a scenario context.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q81 REJECTED
('The @RequestBody annotation maps which of the following?',
 '["URL query parameters to method arguments","The HTTP request body to a Java object using a message converter","Headers to method arguments","Path variables to a map"]'::jsonb,
 '[1]'::jsonb, 'EASY', 4, 22, 'REJECTED', 4, 1, 'Too easy. Add a realistic code scenario.',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days'),

-- Q82 MODIFICATION_REQUESTED
('Which Spring MVC method allows setting both the response body and HTTP status code?',
 '["ResponseEntity.body()","ResponseEntity.ok(body) or ResponseEntity.status(status).body(body)","new ResponseEntity(body)","ResponseEntity.wrap(body, status)"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 4, 21, 'MODIFICATION_REQUESTED', 4, 1, 'Answer is correct but option B contains two forms — split into two questions.',
 NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '4 days'),

-- Q83 MODIFICATION_REQUESTED
('Content negotiation in Spring MVC selects the response format based on which header?',
 '["Content-Type","Authorization","Accept","X-Requested-With"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 4, 24, 'MODIFICATION_REQUESTED', 4, 1, 'Good question. Add a short scenario in the stem to make it more practical.',
 NOW()-INTERVAL '5 days', NOW()-INTERVAL '4 days', NOW()-INTERVAL '3 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '3 days'),

-- Q84 UNDER_REVIEW
('What is the difference between @Controller and @RestController in Spring MVC?',
 '["@Controller can only serve static HTML","@RestController adds @ResponseBody to all handler methods automatically","@Controller is deprecated","@RestController requires @RequestMapping on every method"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 4, 21, 'UNDER_REVIEW', 4, 1, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q85 UNDER_REVIEW
('Which annotation defines a handler for a specific exception type within a @ControllerAdvice class?',
 '["@ExceptionType","@ExceptionHandler","@HandleError","@CatchException"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 4, 23, 'UNDER_REVIEW', 4, 1, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q86 READY_FOR_REVIEW
('Which annotation extracts a query parameter from a URL such as /search?keyword=spring?',
 '["@PathVariable","@RequestBody","@RequestParam","@QueryString"]'::jsonb,
 '[2]'::jsonb, 'EASY', 4, 22, 'READY_FOR_REVIEW', 4, NULL, NULL,
 NOW()-INTERVAL '2 days', NULL, NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days'),

-- Q87 READY_FOR_REVIEW
('Jackson is used by default in Spring MVC for which purpose?',
 '["Rendering HTML templates","Serializing Java objects to JSON and deserializing JSON to Java objects","Managing HTTP sessions","Generating Swagger documentation"]'::jsonb,
 '[1]'::jsonb, 'EASY', 4, 24, 'READY_FOR_REVIEW', 4, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q88 DRAFT
('How do you return a specific HTTP status code from a Spring REST controller method?',
 '["Use System.exit(code)","Use ResponseEntity with the desired HttpStatus","Set status in application.properties","Throw any Exception"]'::jsonb,
 '[1]'::jsonb, 'EASY', 4, 21, 'DRAFT', 4, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- ═══════════════════════════════════════════════════════
-- SPRING ORM & DATA JPA  (stack=5)
-- birendra (3) creates Q89-99, reviewed by admin (1)
-- ═══════════════════════════════════════════════════════

-- Q89 APPROVED
('Which annotation marks a Java class as a JPA-managed persistent entity?',
 '["@Persistent","@Entity","@Model","@Table"]'::jsonb,
 '[1]'::jsonb, 'EASY', 5, 25, 'APPROVED', 3, 1, 'Correct.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q90 APPROVED
('JpaRepository in Spring Data JPA provides which capability out of the box?',
 '["Only findById","CRUD operations, pagination, and sorting without any implementation code","Only custom JPQL queries","Transaction management only"]'::jsonb,
 '[1]'::jsonb, 'EASY', 5, 26, 'APPROVED', 3, 1, 'Good.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q91 APPROVED
('What is the relationship between JPA and Hibernate?',
 '["JPA is a framework and Hibernate is a specification","JPA is a specification and Hibernate is one of its implementations","They are identical","JPA is a Spring module built on top of Hibernate"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 5, 29, 'APPROVED', 3, 1, 'Well-phrased conceptual question.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q92 APPROVED
('The @Transactional annotation on a service method ensures that?',
 '["The method is thread-safe","The method executes within a database transaction context","The method result is cached","The method runs asynchronously"]'::jsonb,
 '[1]'::jsonb, 'EASY', 5, 28, 'APPROVED', 3, 1, 'Clear.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q93 REJECTED
('JPQL is the same as SQL and operates on database tables.',
 '["True","False — JPQL operates on JPA entity objects not tables","True only in PostgreSQL","False — JPQL is only for NoSQL databases"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 5, 27, 'REJECTED', 3, 1, 'True/False format. Rewrite as a scenario-based MCQ.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q94 REJECTED
('The save() method in JpaRepository performs which operation?',
 '["Always creates a new record","Always updates an existing record","Creates a new record if no ID is present, otherwise updates","Deletes and recreates the record"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 5, 26, 'REJECTED', 3, 1, 'Correct but needs a code snippet context to make it practical.',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days'),

-- Q95 UNDER_REVIEW
('What does findById() return in a Spring Data JPA repository?',
 '["The entity directly or throws exception","An Optional<T> that may or may not contain the entity","A List with one or zero elements","null if not found"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 5, 26, 'UNDER_REVIEW', 3, 1, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q96 UNDER_REVIEW
('What is the default transaction propagation behavior of Spring @Transactional?',
 '["REQUIRES_NEW","NOT_SUPPORTED","REQUIRED — joins an existing transaction or creates a new one if none exists","MANDATORY"]'::jsonb,
 '[2]'::jsonb, 'HARD', 5, 28, 'UNDER_REVIEW', 3, 1, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q97 READY_FOR_REVIEW
('Which annotation is used to define a custom JPQL or native query in a Spring Data repository?',
 '["@SQL","@HQL","@Query","@NamedQuery"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 5, 27, 'READY_FOR_REVIEW', 3, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q98 DRAFT
('What does @GeneratedValue(strategy = GenerationType.IDENTITY) tell JPA?',
 '["Generate a UUID for the primary key","Use the database auto-increment column to generate the primary key","Manually assign IDs","Use a sequence object for key generation"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 5, 25, 'DRAFT', 3, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q99 DRAFT
('JPQL differs from SQL in that it operates on which of the following?',
 '["Raw database tables","JPA entity classes and their mapped relationships","In-memory data structures only","XML-mapped objects"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 5, 27, 'DRAFT', 3, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- ═══════════════════════════════════════════════════════
-- CORE JAVA  (stack=6)
-- gaurav (2) creates Q100-116, reviewed by admin (1)
-- ═══════════════════════════════════════════════════════

-- Q100 APPROVED
('Which Object-Oriented Programming principle does method overriding demonstrate in Java?',
 '["Encapsulation","Inheritance","Polymorphism","Abstraction"]'::jsonb,
 '[2]'::jsonb, 'EASY', 6, 30, 'APPROVED', 2, 1, 'Classic and correct.',
 NOW()-INTERVAL '13 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '14 days', NOW()-INTERVAL '11 days'),

-- Q101 APPROVED
('Which Java collection maintains insertion order and allows duplicate elements?',
 '["HashSet","TreeSet","ArrayList","HashMap"]'::jsonb,
 '[2]'::jsonb, 'EASY', 6, 31, 'APPROVED', 2, 1, 'Correct.',
 NOW()-INTERVAL '12 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '13 days', NOW()-INTERVAL '10 days'),

-- Q102 APPROVED
('What does Stream.collect(Collectors.toList()) do?',
 '["Filters stream elements","Sorts the stream","Collects all stream elements into a List","Returns a count of elements"]'::jsonb,
 '[2]'::jsonb, 'EASY', 6, 32, 'APPROVED', 2, 1, 'Good.',
 NOW()-INTERVAL '11 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '12 days', NOW()-INTERVAL '9 days'),

-- Q103 APPROVED
('What is the key difference between checked and unchecked exceptions in Java?',
 '["Checked exceptions are faster","Checked exceptions must be caught or declared with throws; unchecked are RuntimeException subclasses and do not require explicit handling","Unchecked exceptions cannot be caught","Checked exceptions are only for I/O operations"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 6, 33, 'APPROVED', 2, 1, 'Well-phrased.',
 NOW()-INTERVAL '10 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '11 days', NOW()-INTERVAL '8 days'),

-- Q104 APPROVED
('What does the synchronized keyword prevent when used on a Java method?',
 '["The method from throwing exceptions","Multiple threads from executing the method concurrently on the same object instance","The method from being overridden","Garbage collection of the object"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 6, 34, 'APPROVED', 2, 1, 'Accurate.',
 NOW()-INTERVAL '9 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '10 days', NOW()-INTERVAL '7 days'),

-- Q105 REJECTED
('Encapsulation in Java means hiding data using private fields with public getters and setters.',
 '["True","False","Only for static fields","Only for collections"]'::jsonb,
 '[0]'::jsonb, 'EASY', 6, 30, 'REJECTED', 2, 1, 'Formatted as a True/False statement. Rewrite as a proper MCQ.',
 NOW()-INTERVAL '8 days', NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '9 days', NOW()-INTERVAL '6 days'),

-- Q106 REJECTED
('The flatMap() operation in Java Streams is used for?',
 '["Transforming each element to one output","Flattening a stream of streams or collections into a single stream","Sorting elements","Reducing a stream to a single value"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 6, 32, 'REJECTED', 2, 1, 'Correct but options A and B look too similar. Rework the distractors.',
 NOW()-INTERVAL '7 days', NOW()-INTERVAL '6 days', NOW()-INTERVAL '5 days', NOW()-INTERVAL '8 days', NOW()-INTERVAL '5 days'),

-- Q107 UNDER_REVIEW
('Which Java collection is thread-safe and preferred over HashMap for concurrent access?',
 '["LinkedHashMap","TreeMap","ConcurrentHashMap","SynchronizedHashMap"]'::jsonb,
 '[2]'::jsonb, 'MEDIUM', 6, 31, 'UNDER_REVIEW', 2, 1, NULL,
 NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days', NULL, NOW()-INTERVAL '4 days', NOW()-INTERVAL '2 days'),

-- Q108 UNDER_REVIEW
('What is a deadlock in Java multithreading?',
 '["A slow-running thread","A situation where two or more threads wait indefinitely for locks held by each other","A thread that has finished execution","An OutOfMemoryError caused by too many threads"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 6, 34, 'UNDER_REVIEW', 2, 1, NULL,
 NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day', NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '1 day'),

-- Q109 READY_FOR_REVIEW
('Why is implementing Runnable preferred over extending Thread in Java?',
 '["Runnable is faster","Since Java supports single inheritance, implementing Runnable keeps the class hierarchy flexible","Thread is deprecated","Runnable allows returning values"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 6, 34, 'READY_FOR_REVIEW', 2, NULL, NULL,
 NOW()-INTERVAL '2 days', NULL, NULL, NOW()-INTERVAL '3 days', NOW()-INTERVAL '2 days'),

-- Q110 READY_FOR_REVIEW
('What does the volatile keyword ensure in Java multithreading?',
 '["The variable is cached per thread","Changes to the variable are immediately visible to all threads","The variable cannot be modified","The variable is thread-local"]'::jsonb,
 '[1]'::jsonb, 'HARD', 6, 34, 'READY_FOR_REVIEW', 2, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q111 READY_FOR_REVIEW
('Which Java Stream operation is lazy and only executes when a terminal operation is called?',
 '["collect()","forEach()","filter()","count()"]'::jsonb,
 '[2]'::jsonb, 'HARD', 6, 32, 'READY_FOR_REVIEW', 2, NULL, NULL,
 NOW()-INTERVAL '1 day', NULL, NULL, NOW()-INTERVAL '2 days', NOW()-INTERVAL '1 day'),

-- Q112 DRAFT
('What is the key difference between ArrayList and LinkedList in Java?',
 '["They are identical in performance","ArrayList uses a dynamic array with fast random access; LinkedList uses doubly linked nodes with faster insertions and deletions at both ends","LinkedList supports sorting, ArrayList does not","ArrayList is synchronized, LinkedList is not"]'::jsonb,
 '[1]'::jsonb, 'MEDIUM', 6, 31, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q113 DRAFT
('Which keyword in Java is used to explicitly throw an exception?',
 '["throws","catch","throw","raise"]'::jsonb,
 '[2]'::jsonb, 'EASY', 6, 33, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q114 DRAFT
('HashSet enforces uniqueness using which mechanism internally?',
 '["A sorted tree","The hashCode() and equals() methods of the stored objects","A synchronized lock","The Comparable interface"]'::jsonb,
 '[1]'::jsonb, 'HARD', 6, 31, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW()),

-- Q115 DRAFT
('What does the map() operation in Java Streams return?',
 '["A filtered stream","A new stream where each element is the result of applying a given function","A sorted stream","A single reduced value"]'::jsonb,
 '[1]'::jsonb, 'EASY', 6, 32, 'DRAFT', 2, NULL, NULL,
 NULL, NULL, NULL, NOW(), NOW());

-- Spread timestamps across 3 months so analytics charts have variety
UPDATE mcq_questions SET
  created_at   = NOW() - (RANDOM() * INTERVAL '85 days') - INTERVAL '5 days',
  submitted_at = created_at + (RANDOM() * INTERVAL '3 days') + INTERVAL '12 hours',
  assigned_at  = submitted_at + (RANDOM() * INTERVAL '2 days') + INTERVAL '6 hours',
  reviewed_at  = assigned_at + (RANDOM() * INTERVAL '3 days') + INTERVAL '6 hours',
  updated_at   = reviewed_at
WHERE status = 'APPROVED' AND id > 2;

UPDATE mcq_questions SET
  created_at   = NOW() - (RANDOM() * INTERVAL '65 days') - INTERVAL '5 days',
  submitted_at = created_at + (RANDOM() * INTERVAL '3 days') + INTERVAL '12 hours',
  assigned_at  = submitted_at + (RANDOM() * INTERVAL '2 days') + INTERVAL '6 hours',
  reviewed_at  = assigned_at + (RANDOM() * INTERVAL '3 days') + INTERVAL '6 hours',
  updated_at   = reviewed_at
WHERE status = 'REJECTED' AND id > 2;

UPDATE mcq_questions SET
  created_at   = NOW() - (RANDOM() * INTERVAL '45 days') - INTERVAL '5 days',
  submitted_at = created_at + (RANDOM() * INTERVAL '3 days') + INTERVAL '12 hours',
  assigned_at  = submitted_at + (RANDOM() * INTERVAL '2 days') + INTERVAL '6 hours',
  reviewed_at  = assigned_at + (RANDOM() * INTERVAL '3 days') + INTERVAL '6 hours',
  updated_at   = reviewed_at
WHERE status = 'MODIFICATION_REQUESTED' AND id > 2;

UPDATE mcq_questions SET
  created_at   = NOW() - (RANDOM() * INTERVAL '17 days') - INTERVAL '3 days',
  submitted_at = created_at + (RANDOM() * INTERVAL '2 days') + INTERVAL '6 hours',
  assigned_at  = submitted_at + (RANDOM() * INTERVAL '2 days') + INTERVAL '4 hours',
  updated_at   = assigned_at
WHERE status = 'UNDER_REVIEW' AND id > 2;

UPDATE mcq_questions SET
  created_at   = NOW() - (RANDOM() * INTERVAL '8 days') - INTERVAL '2 days',
  submitted_at = created_at + (RANDOM() * INTERVAL '1 day') + INTERVAL '6 hours',
  updated_at   = submitted_at
WHERE status = 'READY_FOR_REVIEW' AND id > 2;

UPDATE mcq_questions SET
  created_at  = NOW() - (RANDOM() * INTERVAL '7 days'),
  updated_at  = created_at
WHERE status = 'DRAFT' AND id > 2;

SQL

TOTAL=$(PGPASSWORD="$PGPASSWORD" psql -h postgres -U "$DB_USERNAME" -d "$DB_NAME" -t -c \
  "SELECT COUNT(*) FROM mcq_questions" | tr -d ' \n')
echo "[seeder] Done. Total questions in database: $TOTAL"
