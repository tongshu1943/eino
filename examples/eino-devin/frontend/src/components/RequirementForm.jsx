import React, { useState, useRef, useEffect } from 'react';

const RequirementForm = ({ initialValues, onSubmit, loading }) => {
  const formRef = useRef(null);
  const [keyFeatureInput, setKeyFeatureInput] = useState('');
  const [nonFunctionalInput, setNonFunctionalInput] = useState('');
  const [keyFeatures, setKeyFeatures] = useState(initialValues.keyFeatures || []);
  const [nonFunctionalRequirements, setNonFunctionalRequirements] = useState(
    initialValues.nonFunctionalRequirements || []
  );
  const [formValues, setFormValues] = useState({
    projectName: initialValues.projectName || '',
    description: initialValues.description || '',
    techStack: initialValues.techStack || [],
    businessGoals: initialValues.businessGoals || '',
    targetUsers: initialValues.targetUsers || '',
    timeline: initialValues.timeline || '',
    additionalNotes: initialValues.additionalNotes || ''
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('warning');

  const Toast = ({ message, type, show }) => {
    if (!show) return null;
    
    const bgColor = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 
                    'bg-yellow-500';
    
    return (
      <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center`}>
        <i className={`mr-2 ${
          type === 'success' ? 'fas fa-check-circle' : 
          type === 'error' ? 'fas fa-exclamation-circle' : 
          'fas fa-exclamation-triangle'
        }`}></i>
        <span>{message}</span>
      </div>
    );
  };

  const showMessage = (content, type = 'warning') => {
    setToastMessage(content);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const message = {
    success: (content) => showMessage(content, 'success'),
    error: (content) => showMessage(content, 'error'),
    warning: (content) => showMessage(content, 'warning')
  };

  const techStackOptions = [
    { value: 'golang', label: 'Golang' },
    { value: 'java', label: 'Java' },
    { value: 'python', label: 'Python' },
    { value: 'nodejs', label: 'Node.js' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'mysql', label: 'MySQL' },
    { value: 'postgresql', label: 'PostgreSQL' },
    { value: 'mongodb', label: 'MongoDB' },
    { value: 'redis', label: 'Redis' },
    { value: 'docker', label: 'Docker' },
    { value: 'kubernetes', label: 'Kubernetes' },
    { value: 'kitex', label: 'Kitex (RPC框架)' },
    { value: 'hertz', label: 'Hertz (Web框架)' },
    { value: 'netpoll', label: 'Netpoll (网络库)' },
    { value: 'thriftgo', label: 'ThriftGo (IDL编译器)' },
    { value: 'sonic', label: 'Sonic (JSON库)' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleTechStackChange = (tech) => {
    const currentTechStack = formValues.techStack || [];
    const newTechStack = currentTechStack.includes(tech)
      ? currentTechStack.filter(item => item !== tech)
      : [...currentTechStack, tech];
    
    setFormValues({
      ...formValues,
      techStack: newTechStack
    });
    
    if (errors.techStack) {
      setErrors({
        ...errors,
        techStack: null
      });
    }
  };

  const handleAddKeyFeature = () => {
    if (!keyFeatureInput.trim()) return;
    
    const newKeyFeatures = [...keyFeatures, keyFeatureInput.trim()];
    setKeyFeatures(newKeyFeatures);
    setKeyFeatureInput('');
    
    if (errors.keyFeatures) {
      setErrors({
        ...errors,
        keyFeatures: null
      });
    }
  };

  const handleRemoveKeyFeature = (removedFeature) => {
    const newKeyFeatures = keyFeatures.filter((feature) => feature !== removedFeature);
    setKeyFeatures(newKeyFeatures);
  };

  const handleAddNonFunctional = () => {
    if (!nonFunctionalInput.trim()) return;
    
    const newNonFunctionalRequirements = [...nonFunctionalRequirements, nonFunctionalInput.trim()];
    setNonFunctionalRequirements(newNonFunctionalRequirements);
    setNonFunctionalInput('');
  };

  const handleRemoveNonFunctional = (removedRequirement) => {
    const newNonFunctionalRequirements = nonFunctionalRequirements.filter(
      (requirement) => requirement !== removedRequirement
    );
    setNonFunctionalRequirements(newNonFunctionalRequirements);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formValues.projectName.trim()) {
      newErrors.projectName = '请输入项目名称';
    }
    
    if (!formValues.description.trim()) {
      newErrors.description = '请输入项目描述';
    }
    
    if (!formValues.techStack || formValues.techStack.length === 0) {
      newErrors.techStack = '请选择技术栈';
    }
    
    if (!formValues.businessGoals.trim()) {
      newErrors.businessGoals = '请输入业务目标';
    }
    
    if (!formValues.targetUsers.trim()) {
      newErrors.targetUsers = '请输入目标用户';
    }
    
    if (keyFeatures.length === 0) {
      newErrors.keyFeatures = '请至少添加一个关键功能';
    }
    
    if (!formValues.timeline.trim()) {
      newErrors.timeline = '请输入项目时间线';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      message.warning('请完善表单信息');
      return;
    }
    
    onSubmit({
      ...formValues,
      keyFeatures,
      nonFunctionalRequirements,
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <Toast message={toastMessage} type={toastType} show={showToast} />
      
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">需求确认</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-400">请确认以下从我们的对话中提取的需求信息，并进行必要的修改或补充。</p>
      
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {/* 项目名称 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            项目名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="projectName"
            value={formValues.projectName}
            onChange={handleInputChange}
            placeholder="请输入项目名称"
            className={`w-full px-4 py-2 rounded-md border ${
              errors.projectName 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } dark:bg-gray-700 dark:text-white transition-colors duration-200`}
          />
          {errors.projectName && (
            <p className="mt-1 text-sm text-red-500">{errors.projectName}</p>
          )}
        </div>
        
        {/* 项目描述 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            项目描述 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formValues.description}
            onChange={handleInputChange}
            placeholder="请简要描述项目的目标和功能"
            rows={4}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.description 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } dark:bg-gray-700 dark:text-white transition-colors duration-200`}
          ></textarea>
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>
        
        {/* 技术栈 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            技术栈 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {techStackOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTechStackChange(option.value)}
                className={`px-3 py-1 rounded-full text-sm ${
                  formValues.techStack && formValues.techStack.includes(option.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                } transition-colors duration-200`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {errors.techStack && (
            <p className="mt-1 text-sm text-red-500">{errors.techStack}</p>
          )}
        </div>
        
        {/* 业务目标 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            业务目标 <span className="text-red-500">*</span>
          </label>
          <textarea
            name="businessGoals"
            value={formValues.businessGoals}
            onChange={handleInputChange}
            placeholder="请描述项目的业务目标和预期成果"
            rows={3}
            className={`w-full px-4 py-2 rounded-md border ${
              errors.businessGoals 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } dark:bg-gray-700 dark:text-white transition-colors duration-200`}
          ></textarea>
          {errors.businessGoals && (
            <p className="mt-1 text-sm text-red-500">{errors.businessGoals}</p>
          )}
        </div>
        
        {/* 目标用户 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            目标用户 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="targetUsers"
            value={formValues.targetUsers}
            onChange={handleInputChange}
            placeholder="请描述项目的目标用户群体"
            className={`w-full px-4 py-2 rounded-md border ${
              errors.targetUsers 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } dark:bg-gray-700 dark:text-white transition-colors duration-200`}
          />
          {errors.targetUsers && (
            <p className="mt-1 text-sm text-red-500">{errors.targetUsers}</p>
          )}
        </div>
        
        {/* 关键功能 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            关键功能 <span className="text-red-500">*</span>
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(请添加项目的关键功能点)</span>
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              placeholder="请输入关键功能"
              value={keyFeatureInput}
              onChange={(e) => setKeyFeatureInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyFeature())}
              className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button
              type="button"
              onClick={handleAddKeyFeature}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-r-md transition-colors duration-200 flex items-center"
            >
              <i className="fas fa-plus mr-1"></i> 添加
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {keyFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{feature}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveKeyFeature(feature)}
                  className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 focus:outline-none"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          {errors.keyFeatures && (
            <p className="mt-1 text-sm text-red-500">{errors.keyFeatures}</p>
          )}
        </div>
        
        {/* 非功能需求 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            非功能需求
            <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(请添加项目的非功能需求，如性能、安全性、可扩展性等)</span>
          </label>
          <div className="flex mb-2">
            <input
              type="text"
              placeholder="请输入非功能需求"
              value={nonFunctionalInput}
              onChange={(e) => setNonFunctionalInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNonFunctional())}
              className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <button
              type="button"
              onClick={handleAddNonFunctional}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-r-md transition-colors duration-200 flex items-center"
            >
              <i className="fas fa-plus mr-1"></i> 添加
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {nonFunctionalRequirements.map((requirement, index) => (
              <div
                key={index}
                className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{requirement}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveNonFunctional(requirement)}
                  className="ml-2 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200 focus:outline-none"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* 时间线 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            时间线 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="timeline"
            value={formValues.timeline}
            onChange={handleInputChange}
            placeholder="请输入项目的预期时间线，如'3个月'"
            className={`w-full px-4 py-2 rounded-md border ${
              errors.timeline 
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
            } dark:bg-gray-700 dark:text-white transition-colors duration-200`}
          />
          {errors.timeline && (
            <p className="mt-1 text-sm text-red-500">{errors.timeline}</p>
          )}
        </div>
        
        {/* 其他说明 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            其他说明
          </label>
          <textarea
            name="additionalNotes"
            value={formValues.additionalNotes}
            onChange={handleInputChange}
            placeholder="请输入其他需要说明的事项"
            rows={3}
            className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          ></textarea>
        </div>
        
        {/* 按钮组 */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors duration-200"
          >
            返回修改
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2 rounded-md transition-colors duration-200 ${
              loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700'
            } text-white flex items-center`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </>
            ) : (
              <>确认需求</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RequirementForm;
