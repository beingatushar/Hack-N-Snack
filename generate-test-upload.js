const XLSX = require('xlsx');
const path = require('path');

// Columns (in order, row 1 = header, rows 2+ = data):
// Question Stem | Option A | Option B | Option C | Option D | Correct Option | Difficulty | Stack Name | Topic Name

const headers = [
  'Question Stem', 'Option A', 'Option B', 'Option C', 'Option D',
  'Correct Option', 'Difficulty', 'Stack Name', 'Topic Name'
];

const rows = [
  // ── Spring Boot (7 questions) ────────────────────────────────────────────
  [
    'What is the primary purpose of Spring Boot?',
    'To replace the Java EE specification',
    'To simplify the setup and development of Spring applications',
    'To provide a GUI framework for Java',
    'To manage database schemas automatically',
    'B', 'EASY', 'Spring Boot', 'Spring Boot Introduction'
  ],
  [
    'Which annotation is used to mark the main class of a Spring Boot application?',
    '@SpringComponent',
    '@EnableSpringBoot',
    '@SpringBootApplication',
    '@BootstrapApplication',
    'C', 'EASY', 'Spring Boot', 'SpringBootApplication annotation'
  ],
  [
    'Maria is starting a new Spring Boot project and needs web, JPA, and security dependencies. What is the easiest way to include them?',
    'Download each JAR manually and add to classpath',
    'Use Spring Boot Starters which bundle related dependencies',
    'Write custom Maven plugins for each dependency',
    'Clone the Spring GitHub repository',
    'B', 'MEDIUM', 'Spring Boot', 'Spring Boot Starters'
  ],
  [
    'Which tool allows developers to see live changes without restarting the server during Spring Boot development?',
    'Spring Actuator',
    'Spring Security',
    'Spring Boot DevTools',
    'Spring Batch',
    'C', 'EASY', 'Spring Boot', 'Spring Boot DevTools'
  ],
  [
    'What does Auto Configuration in Spring Boot do?',
    'Automatically writes unit tests for your code',
    'Configures beans based on classpath dependencies and properties',
    'Deploys the application to a cloud provider',
    'Generates SQL scripts from entity classes',
    'B', 'MEDIUM', 'Spring Boot', 'Auto Configuration'
  ],
  [
    'Alex wants to expose application health and metrics endpoints in his Spring Boot app for monitoring. Which module should he use?',
    'Spring Cloud Gateway',
    'Spring Data REST',
    'Spring Boot Actuator',
    'Spring Batch',
    'C', 'MEDIUM', 'Spring Boot', 'Spring Boot DevTools'
  ],
  [
    'Which class serves as the entry point that bootstraps a Spring Boot application?',
    'ApplicationRunner',
    'BeanFactory',
    'SpringApplication',
    'ContextLoader',
    'C', 'EASY', 'Spring Boot', 'SpringApplication'
  ],

  // ── Core Java (6 questions) ──────────────────────────────────────────────
  [
    'Which OOP principle allows a subclass to provide a specific implementation of a method defined in its parent class?',
    'Abstraction',
    'Encapsulation',
    'Polymorphism',
    'Inheritance',
    'C', 'EASY', 'Core Java', 'OOP Concepts'
  ],
  [
    'Priya is processing a list of employee objects and wants to filter those with salary > 50000 and collect their names. Which Java feature is best suited?',
    'Java Reflection API',
    'Java Streams with filter and map',
    'Java Serialization',
    'Java RMI',
    'B', 'MEDIUM', 'Core Java', 'Java Streams'
  ],
  [
    'Which collection should be used when you need fast key-value lookups and do not care about insertion order?',
    'LinkedList',
    'TreeSet',
    'HashMap',
    'ArrayDeque',
    'C', 'EASY', 'Core Java', 'Collections Framework'
  ],
  [
    'What is the difference between checked and unchecked exceptions in Java?',
    'Checked exceptions extend RuntimeException; unchecked do not',
    'Checked exceptions must be declared or handled at compile time; unchecked are not enforced',
    'Unchecked exceptions always terminate the JVM',
    'There is no difference; both must be caught',
    'B', 'MEDIUM', 'Core Java', 'Exception Handling'
  ],
  [
    'Which keyword is used to ensure that only one thread can execute a method at a time in Java?',
    'volatile',
    'transient',
    'synchronized',
    'static',
    'C', 'MEDIUM', 'Core Java', 'Multithreading'
  ],
  [
    'Which interface must a class implement to be usable in a for-each loop in Java?',
    'Comparable',
    'Cloneable',
    'Iterable',
    'Serializable',
    'C', 'HARD', 'Core Java', 'Collections Framework'
  ],

  // ── Spring Core (5 questions) ────────────────────────────────────────────
  [
    'What is Inversion of Control (IoC) in Spring?',
    'The application controls the creation of objects',
    'The framework takes over the responsibility of creating and managing objects',
    'The database controls the application logic',
    'Controllers invoke services directly without interfaces',
    'B', 'EASY', 'Spring Core', 'Inversion of Control'
  ],
  [
    'Which annotation in Spring is used to inject a dependency automatically by type?',
    '@Inject',
    '@Resource',
    '@Autowired',
    '@Component',
    'C', 'EASY', 'Spring Core', 'Dependency Injection'
  ],
  [
    'Rahul wants a bean to perform some initialization logic after all its properties are set. Which callback should he use?',
    '@PostConstruct',
    '@PreDestroy',
    '@BeforeInit',
    '@Ready',
    'A', 'MEDIUM', 'Spring Core', 'Bean Lifecycle'
  ],
  [
    'Which annotation registers a class as a Spring-managed bean without specifying the layer?',
    '@Service',
    '@Repository',
    '@Controller',
    '@Component',
    'D', 'EASY', 'Spring Core', 'Spring Annotations'
  ],
  [
    'What is the purpose of ApplicationContext in Spring?',
    'It is a database connection pool manager',
    'It is the central interface for providing configuration information and managing beans',
    'It handles HTTP request routing',
    'It generates API documentation',
    'B', 'MEDIUM', 'Spring Core', 'ApplicationContext'
  ],

  // ── Spring MVC & REST (5 questions) ─────────────────────────────────────
  [
    'Which component in Spring MVC acts as the front controller and delegates requests to appropriate handlers?',
    'ViewResolver',
    'HandlerMapping',
    'DispatcherServlet',
    'ModelAndView',
    'C', 'MEDIUM', 'Spring MVC & REST', 'DispatcherServlet'
  ],
  [
    'Anjali is building a REST API where POST /orders returns 201 and GET /orders/{id} returns 404 if not found. Which annotation helps map these routes?',
    '@RequestParam',
    '@RequestMapping / @PostMapping / @GetMapping',
    '@ResponseBody',
    '@ModelAttribute',
    'B', 'EASY', 'Spring MVC & REST', 'Request Mapping'
  ],
  [
    'Which annotation in Spring REST ensures the return value of a method is written directly to the HTTP response body?',
    '@RequestBody',
    '@PathVariable',
    '@ResponseBody',
    '@RequestParam',
    'C', 'EASY', 'Spring MVC & REST', 'REST Controllers'
  ],
  [
    'How does Spring MVC handle global exceptions uniformly across all controllers?',
    'Using try-catch in each controller method',
    'Using @ControllerAdvice with @ExceptionHandler',
    'Using a custom Filter in web.xml',
    'Overriding DispatcherServlet directly',
    'B', 'MEDIUM', 'Spring MVC & REST', 'Exception Handling'
  ],
  [
    'What is Content Negotiation in Spring MVC?',
    'The process of selecting the database driver at runtime',
    'The mechanism by which the server selects the response format based on the client request (Accept header)',
    'Load balancing between microservices',
    'Compressing HTTP responses automatically',
    'B', 'HARD', 'Spring MVC & REST', 'Content Negotiation'
  ],

  // ── Spring ORM & Data JPA (4 questions) ─────────────────────────────────
  [
    'Which annotation is used to mark a Java class as a JPA entity mapped to a database table?',
    '@Table',
    '@Entity',
    '@Column',
    '@MappedSuperclass',
    'B', 'EASY', 'Spring ORM & Data JPA', 'JPA Entities'
  ],
  [
    'Vikram wants to write a repository that supports pagination and sorting out of the box. Which interface should he extend?',
    'CrudRepository',
    'JpaRepository',
    'MongoRepository',
    'PagingAndSortingRepository',
    'B', 'MEDIUM', 'Spring ORM & Data JPA', 'Spring Data Repositories'
  ],
  [
    'Which annotation in Spring ensures a method runs within a database transaction?',
    '@Commit',
    '@Rollback',
    '@Transactional',
    '@Atomic',
    'C', 'EASY', 'Spring ORM & Data JPA', 'Transaction Management'
  ],
  [
    'What does the N+1 select problem refer to in Hibernate?',
    'Running N queries in parallel',
    'Fetching a parent entity generates 1 query plus N additional queries for child entities',
    'Inserting N records with a single batch query',
    'Having more than one @Entity annotation on a class',
    'B', 'HARD', 'Spring ORM & Data JPA', 'Hibernate Integration'
  ],

  // ── Spring Boot — additional ─────────────────────────────────────────────
  [
    'Which file is the primary configuration file in a Spring Boot application?',
    'config.xml',
    'application.properties or application.yml',
    'spring-context.xml',
    'web.xml',
    'B', 'EASY', 'Spring Boot', 'Spring Boot Project Setup'
  ],
  [
    'What does spring-boot-starter-web include by default?',
    'Only Spring MVC',
    'Spring MVC, embedded Tomcat, and Jackson for JSON',
    'Spring Security and Spring MVC',
    'Hibernate and Spring Data JPA',
    'B', 'MEDIUM', 'Spring Boot', 'Spring Boot Starters'
  ],
  [
    'Nisha wants her Spring Boot app to run code after the application context is fully loaded. Which interface should she implement?',
    'InitializingBean',
    'CommandLineRunner',
    'ApplicationContextAware',
    'BeanPostProcessor',
    'B', 'MEDIUM', 'Spring Boot', 'SpringApplication'
  ],
  [
    'How does Spring Boot resolve property values from multiple sources like application.yml, environment variables, and system properties?',
    'Only application.yml is read; others are ignored',
    'It uses a defined property source hierarchy where environment variables override application.yml',
    'System properties always override everything including environment variables',
    'All sources are merged without any priority',
    'B', 'HARD', 'Spring Boot', 'Auto Configuration'
  ],

  // ── Core Java — additional ───────────────────────────────────────────────
  [
    'What is the output of "hello".equals(null) in Java?',
    'NullPointerException',
    'true',
    'false',
    'Compilation error',
    'C', 'EASY', 'Core Java', 'OOP Concepts'
  ],
  [
    'Which Java Stream terminal operation returns the count of elements after applying a filter?',
    'map()',
    'collect()',
    'count()',
    'reduce()',
    'C', 'EASY', 'Core Java', 'Java Streams'
  ],
  [
    'Ravi has two threads incrementing a shared counter. Without synchronization, which problem can occur?',
    'Deadlock',
    'Race condition',
    'ClassCastException',
    'StackOverflowError',
    'B', 'MEDIUM', 'Core Java', 'Multithreading'
  ],
  [
    'Which collection maintains insertion order and allows duplicate elements?',
    'HashSet',
    'TreeMap',
    'ArrayList',
    'LinkedHashSet',
    'C', 'EASY', 'Core Java', 'Collections Framework'
  ],
  [
    'What happens if a checked exception is thrown inside a lambda passed to Stream.forEach()?',
    'It is silently ignored',
    'It is automatically wrapped in RuntimeException',
    'It must be caught inside the lambda or the code will not compile',
    'The stream stops processing remaining elements',
    'C', 'HARD', 'Core Java', 'Java Streams'
  ],

  // ── Spring Core — additional ─────────────────────────────────────────────
  [
    'What is the default bean scope in Spring?',
    'prototype',
    'request',
    'singleton',
    'session',
    'C', 'EASY', 'Spring Core', 'Bean Lifecycle'
  ],
  [
    'Which annotation marks a Spring bean to be loaded only when a specific condition is met (e.g. a property exists)?',
    '@Primary',
    '@Lazy',
    '@Conditional',
    '@Profile',
    'C', 'HARD', 'Spring Core', 'Spring Annotations'
  ],
  [
    'Suresh has two beans implementing the same interface. How does he tell Spring which one to inject by default?',
    '@Autowired',
    '@Primary',
    '@Component',
    '@Qualifier on the interface',
    'B', 'MEDIUM', 'Spring Core', 'Dependency Injection'
  ],

  // ── Spring MVC & REST — additional ──────────────────────────────────────
  [
    'Which annotation extracts a value from the URI path in a Spring REST controller method?',
    '@RequestParam',
    '@RequestBody',
    '@PathVariable',
    '@MatrixVariable',
    'C', 'EASY', 'Spring MVC & REST', 'Request Mapping'
  ],
  [
    'Meera wants her REST endpoint to return HTTP 201 Created with a Location header after saving a resource. Which approach is correct?',
    'Return a plain String from the controller method',
    'Return ResponseEntity with HttpStatus.CREATED and the Location URI',
    'Annotate the method with @ResponseStatus(HttpStatus.OK)',
    'Throw a ResponseStatusException with 201',
    'B', 'MEDIUM', 'Spring MVC & REST', 'REST Controllers'
  ],
  [
    'What is the role of ViewResolver in Spring MVC?',
    'It resolves the correct service bean for a given request',
    'It maps a logical view name returned by a controller to an actual view template',
    'It validates incoming request parameters',
    'It handles CORS preflight requests',
    'B', 'MEDIUM', 'Spring MVC & REST', 'DispatcherServlet'
  ],

  // ── Spring ORM & Data JPA — additional ──────────────────────────────────
  [
    'Which JPQL keyword is used to retrieve only distinct results in a query?',
    'UNIQUE',
    'DISTINCT',
    'GROUP BY',
    'FILTER',
    'B', 'EASY', 'Spring ORM & Data JPA', 'JPQL Queries'
  ],
  [
    'Karan annotates a method with @Transactional(readOnly = true). What is the benefit?',
    'It disables all database writes permanently',
    'It hints to the persistence provider to optimise for read-only operations, skipping dirty checks',
    'It makes the method run in a separate thread',
    'It caches all query results in memory',
    'B', 'HARD', 'Spring ORM & Data JPA', 'Transaction Management'
  ],
  [
    'Which annotation defines a custom JPQL query directly on a Spring Data repository method?',
    '@NativeQuery',
    '@NamedQuery',
    '@Query',
    '@SQL',
    'C', 'MEDIUM', 'Spring ORM & Data JPA', 'JPQL Queries'
  ],
  [
    'What does the @GeneratedValue(strategy = GenerationType.IDENTITY) annotation do on an entity field?',
    'It generates a UUID for the field',
    'It delegates primary key generation to the database auto-increment column',
    'It creates a sequence object in the database',
    'It copies the value from a parent entity',
    'B', 'MEDIUM', 'Spring ORM & Data JPA', 'JPA Entities'
  ],

  // ── Spring Cloud — additional ────────────────────────────────────────────
  [
    'What are Eureka heartbeats used for?',
    'To measure CPU usage of registered services',
    'To allow registered services to renew their lease and stay visible in the registry',
    'To trigger auto-scaling of microservice instances',
    'To synchronise clocks between microservices',
    'B', 'MEDIUM', 'Spring Cloud', 'Eureka Heartbeats & Self Preservation'
  ],
  [
    'What does Eureka Self Preservation mode do?',
    'It removes all expired registrations immediately',
    'It stops expiring registrations when heartbeat loss exceeds a threshold, protecting against network partitions',
    'It backs up the service registry to a database',
    'It prevents new services from registering during high load',
    'B', 'HARD', 'Spring Cloud', 'Eureka Heartbeats & Self Preservation'
  ],
  [
    'Which Spring Cloud module provides health, metrics, and tracing endpoints used by monitoring tools in a microservices setup?',
    'Spring Cloud Config',
    'Spring Cloud Bus',
    'Spring Boot Actuator',
    'Spring Cloud Sleuth',
    'C', 'EASY', 'Spring Cloud', 'Spring Boot Actuator'
  ],
  [
    'Pradeep is writing a Feign client to call an order service. The order service is down. Which Resilience4J feature automatically stops calling it for a period to let it recover?',
    'Rate Limiter',
    'Retry',
    'Circuit Breaker',
    'Bulkhead',
    'C', 'HARD', 'Spring Cloud', 'Resilience4J- Circuit Breaker'
  ],
  [
    'What is the primary benefit of using Spring Cloud OpenFeign over RestTemplate?',
    'Feign is faster at runtime than RestTemplate',
    'Feign generates HTTP client code from annotated interfaces, reducing boilerplate',
    'Feign supports only SOAP web services',
    'Feign bypasses service discovery and uses direct IP addresses',
    'B', 'MEDIUM', 'Spring Cloud', 'Spring Cloud OpenFeign'
  ],
  [
    'In a Spring Cloud setup, which annotation on the main class enables the application to register with Eureka?',
    '@EnableEurekaServer',
    '@EnableFeignClients',
    '@EnableDiscoveryClient',
    '@EnableCircuitBreaker',
    'C', 'EASY', 'Spring Cloud', 'Service Discovery design pattern – Eureka Server & Discovery Client'
  ],

  // ── Intentionally bad row to test error handling ─────────────────────────
  [
    'This row has an invalid correct option to test error handling',
    'Option A', 'Option B', 'Option C', 'Option D',
    'E',   // invalid — must be A/B/C/D
    'EASY', 'Core Java', 'OOP Concepts'
  ]
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

// Auto-size columns
const colWidths = headers.map((h, i) => {
  const maxLen = Math.max(
    h.length,
    ...rows.map(r => String(r[i] ?? '').length)
  );
  return { wch: Math.min(maxLen + 2, 80) };
});
ws['!cols'] = colWidths;

XLSX.utils.book_append_sheet(wb, ws, 'Questions');

const outPath = path.join(__dirname, 'test-bulk-upload.xlsx');
XLSX.writeFile(wb, outPath);
console.log(`Created: ${outPath}`);
console.log(`Rows: ${rows.length} data rows (${rows.length - 1} valid + 1 intentionally invalid)`);
